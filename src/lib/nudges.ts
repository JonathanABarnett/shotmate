import type { AppData } from "../types";
import { DAY } from "./dates";
import { isCompoundedMed } from "./meds";
import { isPushSupported, remindersWanted } from "../sync/pushReminders";

export type NudgeKey = "setup" | "reminders" | "tape" | "photo";

export interface Nudge {
  key: NudgeKey;
  emoji: string;
  text: string;
  cta: string;
}

const RITUAL_GAP_DAYS = 7;
const snoozeStorageKey = (key: NudgeKey) => `shotmate-nudge-${key}`;

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
  if (!snoozed("reminders", now) && signedIn && isPushSupported() && !remindersWanted() && shots.length > 0) {
    return {
      key: "reminders",
      emoji: "🔔",
      text: "Reminders are off — want a nudge the evening before and the morning of shot day?",
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
  return undefined;
}
