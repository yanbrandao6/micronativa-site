import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/adminAuth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "edge";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminContext();
  if (auth.kind === "unauthenticated") return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
  if (auth.kind === "forbidden" || auth.context.role !== "administrador") return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { id } = await params;
  const { error } = await createAdminSupabaseClient().rpc("archive_quote_request", { request_id: id, acting_user_id: auth.context.userId });
  if (error) return NextResponse.json({ error: "Não foi possível arquivar." }, { status: 400 });
  return NextResponse.json({ success: true });
}
