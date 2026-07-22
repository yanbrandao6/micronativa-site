"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getPublicSupabaseEnv } from "./env";

export function createBrowserSupabaseClient() {
  const { url, key } = getPublicSupabaseEnv();
  return createBrowserClient<Database>(url, key);
}
