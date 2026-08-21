import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSyncConfigured, SYNC_CONFIG } from "./config";

let client: SupabaseClient | null = null;

/** Lazily created shared client; null when the build has no backend configured. */
export function getSupabase(): SupabaseClient | null {
  if (!isSyncConfigured()) return null;
  if (!client) {
    client = createClient(SYNC_CONFIG.supabaseUrl, SYNC_CONFIG.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}
