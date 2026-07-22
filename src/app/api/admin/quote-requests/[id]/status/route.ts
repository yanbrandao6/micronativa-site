import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/adminAuth";
import { sanitizePlainText } from "@/lib/normalization";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "edge";
const schema = z.object({ status: z.enum(["recebido", "em_analise", "contato_realizado", "aguardando_cliente", "visita_agendada", "proposta_enviada", "em_execucao", "concluido", "cancelado"]), publicMessage: z.string().max(500).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminContext();
  if (auth.kind === "unauthenticated") return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
  if (auth.kind === "forbidden") return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const { id } = await params;
  const { error } = await createAdminSupabaseClient().rpc("update_quote_request_status", { request_id: id, requested_status: parsed.data.status, requested_public_message: parsed.data.publicMessage ? sanitizePlainText(parsed.data.publicMessage, 500) : "", acting_user_id: auth.context.userId });
  if (error) return NextResponse.json({ error: error.message.includes("invalid_status_transition") ? "Transição de status não permitida." : "Não foi possível alterar o status." }, { status: 400 });
  return NextResponse.json({ success: true });
}
