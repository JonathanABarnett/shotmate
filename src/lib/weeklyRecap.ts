import type { AppData } from "../types";
import { DAY, startOfDay } from "./dates";
import { absWeight } from "./format";
import { trendVsToday } from "./insights/noiseTrend";
import { mean } from "./insights/shared";

export interface WeeklyRecap {
  key: string;
  narrative: string;
  stats: { value: string; label: string }[];
}

const SHOW_FROM_HOUR = 17;
const HANDLED_PREFIX = "shotmate-recap-";

export function dismissRecap(key: string): void {
  try {
    localStorage.setItem(HANDLED_PREFIX + key, "1");
  } catch {
    // storage unavailable — the letter just shows again
  }
}

function dismissed(key: string): boolean {
  try {
    return localStorage.getItem(HANDLED_PREFIX + key) === "1";
  } catch {
    return false;
  }
}

/** The Sunday letter: a short, kind read on the week — Sunday evening through Monday. */
export function weeklyRecap(data: AppData, now = Date.now()): WeeklyRecap | undefined {
  if (data.sample || !data.onboarded) return undefined;
  const d = new Date(now);
  const sundayEvening = d.getDay() === 0 && d.getHours() >= SHOW_FROM_HOUR;
  if (!sundayEvening && d.getDay() !== 1) return undefined;
  const weekEnd = startOfDay(now) + (sundayEvening ? DAY : 0);
  const weekStart = weekEnd - 7 * DAY;
  const key = String(weekStart);
  if (dismissed(key)) return undefined;

  const inWeek = (ts: number) => ts >= weekStart && ts < weekEnd;
  const weighs = data.weights.filter((w) => inWeek(w.ts));
  const moves = data.activities.filter((a) => inWeek(a.ts));
  const minutes = moves.reduce((sum, a) => sum + a.minutes, 0);
  const checkins = data.checkins.filter((c) => inWeek(c.day));
  const shots = data.shots.filter((s) => inWeek(s.ts));
  const sleepAvg = mean(checkins.flatMap((c) => (c.sleep != null ? [c.sleep] : [])));
  const kcalDays = data.intake.filter((i) => inWeek(i.day) && (i.kcal ?? 0) > 0);

  if (weighs.length === 0 && moves.length === 0 && checkins.length <= 1) {
    return { key, narrative: "A quiet week — they happen, and nothing is lost. One small log tomorrow restarts the rhythm 💜", stats: [] };
  }

  const trend = trendVsToday(data, weekEnd);
  const bits: string[] = [];
  if (trend && trend.weeklyChangeLbs <= -0.5) bits.push(`Down ${absWeight(Math.abs(trend.weeklyChangeLbs), data.settings.unit)} on the trend.`);
  if (moves.length >= 3) bits.push(`${moves.length} walks — ${minutes} minutes on your feet.`);
  if (checkins.length >= 7) bits.push("Checked in every single day.");
  else if (checkins.length >= 4) bits.push(`${checkins.length} days checked in.`);
  if (shots.length > 0) bits.push("Shot day: handled.");
  if (sleepAvg != null && sleepAvg < 2.6) bits.push("Sleep ran rough — the kindest lever you've got this week.");
  if (bits.length === 0) bits.push("Still here, still moving — that counts 💜");

  return {
    key,
    narrative: bits.join(" "),
    stats: [
      ...(weighs.length ? [{ value: `${weighs.length}`, label: "weigh-ins" }] : []),
      ...(moves.length ? [{ value: `${minutes}`, label: "active min" }] : []),
      ...(checkins.length ? [{ value: `${checkins.length}/7`, label: "check-in days" }] : []),
      ...(sleepAvg != null ? [{ value: sleepAvg.toFixed(1), label: "avg sleep" }] : []),
      ...(kcalDays.length >= 3 ? [{ value: `${Math.round(mean(kcalDays.map((i) => i.kcal!))!)}`, label: "avg kcal" }] : []),
    ],
  };
}
