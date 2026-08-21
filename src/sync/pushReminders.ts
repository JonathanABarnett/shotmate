import type { SupabaseClient } from "@supabase/supabase-js";
import { SYNC_CONFIG } from "./config";

/** What the reminder sender needs to know about this user's schedule. */
export interface ReminderSchedule {
  nextDueTs?: number;
  scheduleDays: number;
  doseMg: number;
  medName: string;
}

const REMINDER_FLAG = "shotmate-reminders";

export const isPushSupported = (): boolean =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const remindersWanted = (): boolean => localStorage.getItem(REMINDER_FLAG) === "on";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function activeRegistration(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) throw new Error("Reminders need the installed app (the service worker isn't running here).");
  return reg;
}

function rowFor(userId: string, sub: PushSubscription, schedule: ReminderSchedule) {
  return {
    user_id: userId,
    endpoint: sub.endpoint,
    subscription: sub.toJSON(),
    tz_offset_min: new Date().getTimezoneOffset(),
    schedule_days: schedule.scheduleDays,
    next_due: schedule.nextDueTs != null ? new Date(schedule.nextDueTs).toISOString() : null,
    dose_mg: schedule.doseMg,
    med_name: schedule.medName,
  };
}

/** Ask permission, subscribe this device, and register it with the reminder sender. */
export async function enableReminders(sb: SupabaseClient, userId: string, schedule: ReminderSchedule): Promise<void> {
  if (!isPushSupported()) throw new Error("This browser can't receive push notifications.");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notifications are blocked for ShotMate in your browser settings.");
  const reg = await activeRegistration();
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(SYNC_CONFIG.vapidPublicKey).buffer as ArrayBuffer,
    }));
  const { error } = await sb.from("push_subscriptions").upsert(rowFor(userId, sub, schedule), { onConflict: "endpoint" });
  if (error) throw new Error(error.message);
  localStorage.setItem(REMINDER_FLAG, "on");
}

/** Unsubscribe this device and forget it server-side. */
export async function disableReminders(sb: SupabaseClient): Promise<void> {
  localStorage.removeItem(REMINDER_FLAG);
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await sb.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
  await sub.unsubscribe();
}

/** Keep the server's copy of the schedule current (call when shots or settings change). */
export async function updateReminderSchedule(sb: SupabaseClient, userId: string, schedule: ReminderSchedule): Promise<void> {
  if (!remindersWanted() || !isPushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await sb.from("push_subscriptions").upsert(rowFor(userId, sub, schedule), { onConflict: "endpoint" });
}
