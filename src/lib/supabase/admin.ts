import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSecretSupabaseEnv } from "./env";

export function createAdminSupabaseClient() {
  const { url, key } = getSecretSupabaseEnv();
  return createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
