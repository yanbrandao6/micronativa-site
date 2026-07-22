import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/adminAuth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "edge";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; attachmentId: string }> }) {
  const auth = await getAdminContext();
  if (auth.kind === "unauthenticated") return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
  if (auth.kind === "forbidden") return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { id, attachmentId } = await params;
  const { data: attachment, error } = await auth.context.supabase.from("quote_request_attachments").select("storage_bucket, storage_path").eq("id", attachmentId).eq("quote_request_id", id).maybeSingle();
  if (error || !attachment) return NextResponse.json({ error: "Anexo não encontrado." }, { status: 404 });
  const { data, error: signedError } = await createAdminSupabaseClient().storage.from(attachment.storage_bucket).createSignedUrl(attachment.storage_path, 60, { download: true });
  if (signedError || !data.signedUrl) return NextResponse.json({ error: "Não foi possível gerar o link." }, { status: 503 });
  return NextResponse.json({ url: data.signedUrl, expiresIn: 60 }, { headers: { "Cache-Control": "no-store" } });
}
