import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { rateLimitRequest } from "@/lib/rateLimit";
import { hasValidFileSignature, MAX_ATTACHMENT_FILES, quoteRequestPayloadSchema, validateAttachment } from "@/lib/validation/quoteRequest";
import { sanitizePlainText } from "@/lib/normalization";
import type { Json, TablesInsert } from "@/types/database";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const genericError = "Não foi possível enviar a solicitação. Revise os dados e tente novamente.";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function safeOriginalName(name: string) {
  const filename = name.replace(/^.*[\\/]/, "").replace(/[\u0000-\u001F\u007F]/g, "").trim();
  return filename.slice(0, 255) || "arquivo";
}

export async function POST(request: Request) {
  const limit = await rateLimitRequest(request, "quote-submit", 4, 10 * 60_000);
  if (!limit.allowed) return jsonError("Muitas tentativas. Aguarde alguns minutos e tente novamente.", 429);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(genericError, 400);
  }

  const rawPayload = formData.get("payload");
  if (typeof rawPayload !== "string") return jsonError(genericError, 400);

  let unknownPayload: unknown;
  try {
    unknownPayload = JSON.parse(rawPayload);
  } catch {
    return jsonError(genericError, 400);
  }

  const parsed = quoteRequestPayloadSchema.safeParse(unknownPayload);
  if (!parsed.success || parsed.data.website) return jsonError(genericError, 400);

  const files = formData.getAll("attachments").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length > MAX_ATTACHMENT_FILES) return jsonError("Você pode enviar no máximo 6 arquivos.", 400);
  const validatedFiles: Array<{ file: File; extension: string }> = [];
  for (const file of files) {
    const validation = validateAttachment(file);
    if (!validation.valid) return jsonError(validation.error, 400);
    if (!(await hasValidFileSignature(file))) return jsonError("Um dos arquivos não corresponde ao formato informado.", 400);
    validatedFiles.push({ file, extension: validation.extension });
  }

  const payload = parsed.data;
  const supabase = createAdminSupabaseClient();
  const { data: existing, error: existingError } = await supabase
    .from("quote_requests")
    .select("protocol, created_at, service, submission_completed_at")
    .eq("idempotency_key", payload.idempotencyKey)
    .maybeSingle();

  if (existingError) return jsonError(genericError, 503);
  if (existing?.submission_completed_at) {
    return NextResponse.json({ accepted: true, protocol: existing.protocol, createdAt: existing.created_at, service: existing.service, duplicate: true }, { headers: { "Cache-Control": "no-store" } });
  }
  if (existing) return jsonError("Esta solicitação ainda está sendo processada. Aguarde e tente novamente.", 409);

  const projectDetails = Object.fromEntries(Object.entries(payload.projectDetails).map(([key, value]) => [key, typeof value === "string" ? sanitizePlainText(value, 2000) : value])) as Json;
  const insert: TablesInsert<"quote_requests"> = {
    idempotency_key: payload.idempotencyKey,
    service: payload.service,
    additional_services: payload.additionalServices,
    property_type: payload.propertyType,
    purpose: payload.purpose,
    city: payload.city,
    state: payload.state,
    project_details: projectDetails,
    customer_name: payload.customer.name,
    customer_phone: payload.customer.phone,
    customer_phone_normalized: payload.customer.phone,
    customer_whatsapp: payload.customer.whatsapp || null,
    customer_whatsapp_normalized: payload.customer.whatsapp || null,
    customer_email: payload.customer.email,
    customer_email_normalized: payload.customer.email,
    preferred_contact_method: payload.preferredContactMethod,
    privacy_consent_at: new Date().toISOString(),
    source_page: payload.sourcePage,
    project_reference: payload.projectReference ?? null,
  };

  const { data: created, error: createError } = await supabase
    .from("quote_requests")
    .insert(insert)
    .select("id, protocol, created_at, service")
    .single();

  if (createError) {
    if (createError.code === "23505") {
      const { data: duplicate } = await supabase.from("quote_requests").select("protocol, created_at, service, submission_completed_at").eq("idempotency_key", payload.idempotencyKey).maybeSingle();
      if (duplicate?.submission_completed_at) return NextResponse.json({ accepted: true, protocol: duplicate.protocol, createdAt: duplicate.created_at, service: duplicate.service, duplicate: true }, { headers: { "Cache-Control": "no-store" } });
      return jsonError("Esta solicitação ainda está sendo processada. Aguarde e tente novamente.", 409);
    }
    return jsonError(genericError, 503);
  }

  const uploadedPaths: string[] = [];
  try {
    const attachmentRows: TablesInsert<"quote_request_attachments">[] = [];
    for (const [index, item] of validatedFiles.entries()) {
      const storagePath = `${created.id}/${crypto.randomUUID()}.${item.extension === "jpeg" ? "jpg" : item.extension}`;
      const { error: uploadError } = await supabase.storage.from("quote-attachments").upload(storagePath, await item.file.arrayBuffer(), {
        contentType: item.file.type,
        upsert: false,
        cacheControl: "3600",
      });
      if (uploadError) throw uploadError;
      uploadedPaths.push(storagePath);
      attachmentRows.push({
        quote_request_id: created.id,
        attachment_index: index + 1,
        storage_path: storagePath,
        original_name: safeOriginalName(item.file.name),
        mime_type: item.file.type,
        size_bytes: item.file.size,
      });
    }

    if (attachmentRows.length) {
      const { error: attachmentError } = await supabase.from("quote_request_attachments").insert(attachmentRows);
      if (attachmentError) throw attachmentError;
    }

    const { error: completeError } = await supabase
      .from("quote_requests")
      .update({ submission_completed_at: new Date().toISOString() })
      .eq("id", created.id);
    if (completeError) throw completeError;
  } catch {
    if (uploadedPaths.length) await supabase.storage.from("quote-attachments").remove(uploadedPaths);
    await supabase.from("quote_requests").delete().eq("id", created.id);
    return jsonError("Não foi possível concluir o envio dos anexos. Nenhuma solicitação foi registrada; tente novamente.", 503);
  }

  return NextResponse.json({ accepted: true, protocol: created.protocol, createdAt: created.created_at, service: created.service, duplicate: false }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
