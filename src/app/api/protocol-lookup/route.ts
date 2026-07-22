import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { buildPublicQuoteLookupResult } from "@/lib/publicQuoteLookup";
import { rateLimitRequest } from "@/lib/rateLimit";
import { protocolLookupSchema } from "@/lib/validation/quoteRequest";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const notFoundMessage = "Não foi possível localizar uma solicitação com os dados informados.";

export async function POST(request: Request) {
  const limit = await rateLimitRequest(request, "protocol-lookup", 8, 10 * 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }, { status: 429 });

  const parsed = protocolLookupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: notFoundMessage }, { status: 404, headers: { "Cache-Control": "no-store" } });

  const supabase = createAdminSupabaseClient();
  const { data: quote, error } = await supabase
    .from("quote_requests")
    .select("id, protocol, service, created_at, status, updated_at")
    .eq("protocol", parsed.data.protocol)
    .eq("customer_email_normalized", parsed.data.email)
    .not("submission_completed_at", "is", null)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !quote) return NextResponse.json({ error: notFoundMessage }, { status: 404, headers: { "Cache-Control": "no-store" } });

  const { data: history, error: historyError } = await supabase
    .from("quote_request_status_history")
    .select("new_status, public_message, created_at")
    .eq("quote_request_id", quote.id)
    .order("created_at", { ascending: true });

  if (historyError) return NextResponse.json({ error: notFoundMessage }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(buildPublicQuoteLookupResult(quote, history ?? []), { headers: { "Cache-Control": "no-store" } });
}
