import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { AppData } from "../types";
import { medFor } from "../lib/meds";
import { nextDueTs } from "../lib/shots";
import { isDemoRequest } from "../store/persistence";
import type { Action } from "../store/reducer";
import { isSyncConfigured } from "./config";
import { getSupabase } from "./supabaseClient";
import { updateReminderSchedule, type ReminderSchedule } from "./pushReminders";

export type SyncStatus = "unconfigured" | "signed-out" | "syncing" | "synced" | "error";

export interface SyncState {
  status: SyncStatus;
  email?: string;
  userId?: string;
  lastSyncAt?: number;
  error?: string;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const PUSH_DEBOUNCE_MS = 1500;

/** Photos are device-local (their pixels live in IndexedDB) — everything else syncs. */
const stripLocalOnly = (data: AppData): AppData => ({ ...data, photos: [] });
const mergeLocalOnly = (remote: AppData, local: AppData): AppData => ({ ...remote, photos: local.photos });

export function scheduleFor(data: AppData): ReminderSchedule {
  return {
    nextDueTs: nextDueTs(data.shots, data.settings.scheduleDays),
    scheduleDays: data.settings.scheduleDays,
    doseMg: data.settings.plannedDoseMg,
    medName: medFor(data.settings).brand,
  };
}

/**
 * Last-write-wins snapshot sync: pull on sign-in / focus, push (debounced) when
 * local data changes. Demo mode and unconfigured builds never touch the network.
 */
export function useSync(data: AppData, dispatch: (a: Action) => void): SyncState {
  const sb = getSupabase();
  const enabled = !!sb && !isDemoRequest();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<SyncStatus>(isSyncConfigured() ? "signed-out" : "unconfigured");
  const [lastSyncAt, setLastSyncAt] = useState<number>();
  const [error, setError] = useState<string>();
  const remoteUpdatedAt = useRef(0);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    if (!enabled) return;
    sb.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: sub } = sb.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, [sb, enabled]);

  const pull = useCallback(async () => {
    if (!enabled || !session) return;
    setStatus("syncing");
    const { data: row, error: err } = await sb
      .from("snapshots")
      .select("data, updated_at")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (err) {
      setStatus("error");
      setError(err.message);
      return;
    }
    const local = dataRef.current;
    if (row) {
      const remoteTs = new Date(row.updated_at as string).getTime();
      remoteUpdatedAt.current = remoteTs;
      if (remoteTs > (local.updatedAt ?? 0)) {
        dispatch({ type: "replaceFromSync", data: mergeLocalOnly({ ...(row.data as AppData), updatedAt: remoteTs }, local) });
      }
    }
    setStatus("synced");
    setLastSyncAt(Date.now());
  }, [sb, enabled, session, dispatch]);

  const push = useCallback(async () => {
    if (!enabled || !session) return;
    const local = dataRef.current;
    const localTs = local.updatedAt ?? 0;
    if (localTs <= remoteUpdatedAt.current) return;
    setStatus("syncing");
    const { error: err } = await sb.from("snapshots").upsert(
      { user_id: session.user.id, data: stripLocalOnly(local), updated_at: new Date(localTs).toISOString() },
      { onConflict: "user_id" }
    );
    if (err) {
      setStatus("error");
      setError(err.message);
      return;
    }
    remoteUpdatedAt.current = localTs;
    setStatus("synced");
    setLastSyncAt(Date.now());
    void updateReminderSchedule(sb, session.user.id, scheduleFor(local));
  }, [sb, enabled, session]);

  // Pull when signed in and whenever the app comes back into view.
  useEffect(() => {
    if (!enabled || !session) return;
    void pull();
    const onVisible = () => document.visibilityState === "visible" && void pull();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [enabled, session, pull]);

  // Push local changes, debounced.
  useEffect(() => {
    if (!enabled || !session) return;
    const timer = setTimeout(() => void push(), PUSH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [enabled, session, data.updatedAt, push]);

  useEffect(() => {
    if (enabled && !session && status !== "unconfigured") setStatus("signed-out");
  }, [enabled, session, status]);

  return {
    status,
    email: session?.user.email ?? undefined,
    userId: session?.user.id,
    lastSyncAt,
    error,
    signIn: async (email) => {
      if (!sb) return;
      const { error: err } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
      if (err) throw new Error(err.message);
    },
    signOut: async () => {
      await sb?.auth.signOut();
      remoteUpdatedAt.current = 0;
    },
    syncNow: async () => {
      await pull();
      await push();
    },
  };
}
