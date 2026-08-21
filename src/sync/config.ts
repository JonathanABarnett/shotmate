/**
 * Backend wiring for optional sync + reminders. The anon key is safe to ship —
 * row-level security keeps every user's data private. Leave URL/key empty to
 * run fully offline with no backend at all.
 */
export const SYNC_CONFIG = {
  supabaseUrl: "https://rhwgogxtnenedymdyjer.supabase.co",
  supabaseAnonKey: "sb_publishable_sOVdUOBTJpk3MbOrcA_sKA_6tYw7FIo",
  vapidPublicKey: "BNfCTOJudqGfsHXQN1WADFZqjfMUt-NO5q-5i4DFD2BqiraBILxirIutl1snZhuMmp3lzm0b_W9eHYW_0UMwTP4",
};

export const isSyncConfigured = (): boolean => SYNC_CONFIG.supabaseUrl !== "" && SYNC_CONFIG.supabaseAnonKey !== "";
