import type { AppData, Shot } from "../types";
import { DAY, HOUR } from "./dates";
import { isCompoundedMed } from "./meds";
import { sortedShots } from "./shots";
import { isPushSupported, remindersWanted } from "../sync/pushReminders";

export type NudgeKey = "setup" | "reminders" | "tape" | "photo" | "backup";

export interface Nudge {
  key: NudgeKey;
  emoji: string;
  text: string;
  cta: string;
}

const RITUAL_GAP_DAYS = 7;
/** matches the adherence insight's on-time window */
const LATE_TOLERANCE_H = 24;
/** only the last few cycles count — ancient slips shouldn't nag forever */
const RECENT_GAPS = 4;
const BACKUP_REFRESH_DAYS = 30;

const snoozeStorageKey = (key: NudgeKey) => `shotmate-nudge-${key}`;
const BACKUP_STORAGE_KEY = "shotmate-last-backup";

export function snoozeNudge(key: NudgeKey, days = 30): void {
  try {
    localStorage.setItem(snoozeStorageKey(key), String(Date.now() + days * DAY));
  } catch {
    // storage unavailable — the nudge just shows again
  }
}

function snoozed(key: NudgeKey, now: number): boolean {
  try {
    return Number(localStorage.getItem(snoozeStorageKey(key)) ?? 0) > now;
  } catch {
    return false;
  }
}

/** Called whenever a backup file is downloaded, from any entry point. */
export function recordBackup(now = Date.now()): void {
  try {
    localStorage.setItem(BACKUP_STORAGE_KEY, String(now));
  } catch {
    // storage unavailable — the backup nudge just shows again
  }
}

function lastBackupTs(): number {
  try {
    return Number(localStorage.getItem(BACKUP_STORAGE_KEY) ?? 0);
  } catch {
    return 0;
  }
}

/** True when shots have actually slipped — a late cycle recently, or running long right now. */
export function shotsLookInconsistent(shots: Shot[], scheduleDays: number, now = Date.now()): boolean {
  const sorted = sortedShots(shots);
  const last = sorted.at(-1);
  if (!last) return false;
  const lateMs = scheduleDays * DAY + LATE_TOLERANCE_H * HOUR;
  if (now - last.ts > lateMs) return true;
  const recent = sorted.slice(-(RECENT_GAPS + 1));
  return recent.slice(1).some((shot, i) => shot.ts - recent[i].ts > lateMs);
}

function backupNudge(data: AppData, signedIn: boolean, now: number): Nudge | undefined {
  const { shots, weights, effects, photos } = data;
  const hasEntries = shots.length + weights.length + effects.length > 0;
  if (photos.length === 0 && (signedIn || !hasEntries)) return undefined;

  const backedUp = lastBackupTs();
  const oldestTs = Math.min(
    ...(photos.length > 0 ? photos.map((p) => p.ts) : [...shots.map((s) => s.ts), ...weights.map((w) => w.ts)])
  );
  const due =
    backedUp === 0 ? now - oldestTs >= RITUAL_GAP_DAYS * DAY : now - backedUp >= BACKUP_REFRESH_DAYS * DAY;
  if (!due) return undefined;

  const text =
    backedUp !== 0
      ? "It's been a month since your last backup — tap to save a fresh copy."
      : photos.length > 0
        ? "Your photos live only on this phone. One tap saves a complete backup file, photos included."
        : "Your data lives only in this browser. One tap saves a backup file you can restore anywhere.";
  return { key: "backup", emoji: "📦", text, cta: "Save backup" };
}

/** The single most useful nudge right now, or nothing — never a stack of banners. */
export function topNudge(data: AppData, signedIn: boolean, now = Date.now()): Nudge | undefined {
  if (data.sample || !data.onboarded) return undefined;
  const { settings, measures, shots } = data;

  if (!snoozed("setup", now) && isCompoundedMed(settings.medKey) && (settings.vialMgPerMl == null || settings.supplyMg == null)) {
    return {
      key: "setup",
      emoji: "🧪",
      text: "Add your vial strength and supply in Settings — it unlocks the draw calculator, reorder forecast, and cost view.",
      cta: "Finish setup",
    };
  }
  if (
    !snoozed("reminders", now) &&
    signedIn &&
    isPushSupported() &&
    !remindersWanted() &&
    shotsLookInconsistent(shots, settings.scheduleDays, now)
  ) {
    return {
      key: "reminders",
      emoji: "🔔",
      text: "That last cycle ran long. Reminders ping you the evening before and the morning of shot day — want them?",
      cta: "Turn on",
    };
  }
  const lastTape = measures.reduce((max, m) => Math.max(max, m.ts), 0);
  if (!snoozed("tape", now) && measures.length > 0 && now - lastTape >= RITUAL_GAP_DAYS * DAY) {
    return {
      key: "tape",
      emoji: "📏",
      text: "Tape day — a week since your last measurements. The tape often moves when the scale sulks.",
      cta: "Measure",
    };
  }
  const lastPhoto = data.photos.reduce((max, p) => Math.max(max, p.ts), 0);
  if (!snoozed("photo", now) && data.photos.length > 0 && now - lastPhoto >= RITUAL_GAP_DAYS * DAY) {
    return {
      key: "photo",
      emoji: "📸",
      text: "Photo day — same pose, same spot, same light. Future you will love this one.",
      cta: "Take it",
    };
  }
  return backupNudge(data, signedIn, now);
}
