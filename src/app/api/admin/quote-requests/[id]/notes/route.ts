import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/adminAuth";
import { sanitizePlainText } from "@/lib/normalization";

export const runtime = "edge";
const schema = z.object({ content: z.string().min(1).max(5000) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminContext();
  if (auth.kind === "unauthenticated") return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
  if (auth.kind === "forbidden") return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nota inválida." }, { status: 400 });
  const { id } = await params;
  const { error } = await auth.context.supabase.from("quote_request_notes").insert({ quote_request_id: id, author_id: auth.context.userId, content: sanitizePlainText(parsed.data.content, 5000) });
  if (error) return NextResponse.json({ error: "Não foi possível adicionar a nota." }, { status: 400 });
  return NextResponse.json({ success: true }, { status: 201 });
}
