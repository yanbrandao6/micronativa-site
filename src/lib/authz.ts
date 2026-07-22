import type { AdminRole } from "@/config/quoteStatuses";

export type AdminRecord = { active: boolean; role: AdminRole } | null;

export function classifyAdminAccess(userId: string | null, admin: AdminRecord) {
  if (!userId) return "unauthenticated" as const;
  if (!admin?.active) return "forbidden" as const;
  return "authorized" as const;
}

export function roleAllowed(role: AdminRole, allowed?: AdminRole[]) {
  return !allowed || allowed.includes(role);
}
