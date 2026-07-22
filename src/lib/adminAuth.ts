import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/config/quoteStatuses";
import { classifyAdminAccess } from "@/lib/authz";

export type AdminContext = {
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  userId: string;
  email: string;
  role: AdminRole;
};

export async function getAdminContext(): Promise<{ kind: "authenticated"; context: AdminContext } | { kind: "unauthenticated" } | { kind: "forbidden" }> {
  const supabase = await createServerSupabaseClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : null;
  if (claimsError || !userId) return { kind: "unauthenticated" };

  const { data: admin } = await supabase.from("admin_users").select("role, active").eq("user_id", userId).maybeSingle();
  if (!admin || classifyAdminAccess(userId, admin) === "forbidden") return { kind: "forbidden" };
  return {
    kind: "authenticated",
    context: {
      supabase,
      userId,
      email: typeof claimsData?.claims?.email === "string" ? claimsData.claims.email : "",
      role: admin.role,
    },
  };
}

export async function requireAdmin(): Promise<AdminContext> {
  const result = await getAdminContext();
  if (result.kind === "unauthenticated") redirect("/admin/login?motivo=sessao");
  if (result.kind === "forbidden") redirect("/admin/acesso-negado");
  return result.context;
}
