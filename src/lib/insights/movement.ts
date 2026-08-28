import type { AppData } from "../../types";
import { DAY, startOfDay } from "../dates";

export interface MovementHabit {
  /** consecutive active days ending today (or yesterday, so mornings don't zero it) */
  streakDays: number;
  activeDays14: number;
  weekMinutes: number;
  /** total logged distance over the last 7 days, when any activity carries one */
  weekMiles?: number;
  prevWeekMinutes: number;
  summary: string;
}

const MIN_ACTIVE_DAYS = 5;

/** Recognize a real movement routine: streak, weekly minutes, and direction. */
export function movementHabit(data: AppData, now = Date.now()): MovementHabit | undefined {
  if (data.activities.length === 0) return undefined;
  const today = startOfDay(now);
  const days = new Set(data.activities.map((a) => startOfDay(a.ts)));
  const activeDays14 = [...days].filter((d) => d > today - 14 * DAY).length;
  if (activeDays14 < MIN_ACTIVE_DAYS) return undefined;

  let streakDays = 0;
  let cursor = days.has(today) ? today : today - DAY;
  while (days.has(cursor)) {
    streakDays++;
    cursor -= DAY;
  }

  const week = data.activities.filter((a) => a.ts >= today - 6 * DAY && a.ts < today + DAY);
  const weekMinutes = week.reduce((sum, a) => sum + a.minutes, 0);
  const miles = week.reduce((sum, a) => sum + (a.distanceMi ?? 0), 0);
  const prevWeekMinutes = data.activities
    .filter((a) => a.ts >= today - 13 * DAY && a.ts < today - 6 * DAY)
    .reduce((sum, a) => sum + a.minutes, 0);

  const opener = streakDays >= 3 ? `You're on a ${streakDays}-day streak` : `You moved on ${activeDays14} of the last 14 days`;
  const rising = prevWeekMinutes > 0 && weekMinutes >= prevWeekMinutes * 1.2 ? ", and the week is up on the one before" : "";
  const summary = `${opener} — ${weekMinutes} active minutes in the last 7 days${rising}. Movement like this blunts hunger, protects muscle while you lose, and compounds quietly.`;

  return { streakDays, activeDays14, weekMinutes, weekMiles: miles > 0 ? Math.round(miles * 10) / 10 : undefined, prevWeekMinutes, summary };
}
