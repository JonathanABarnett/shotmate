import type { ActivityEntry, AppData, EffectEntry, Shot, WeightEntry } from "../types";
import { DAY, fmtWeekday, startOfDay } from "./dates";
import { isFeelingFine } from "./effects";
import { effectTimingBuckets } from "./insights";
import { trendWeightLbs } from "./insights/noiseTrend";
import { cycleOffsetDays } from "./insights/shared";
import { isLongestYet, isNewLow } from "./records";
import { streak } from "./shots";
import { fmtWeight } from "./weight";

/** A morning this far above the 7-day trend is fluid, not fat — worth saying so before it stings. */
const JUMP_ABOVE_TREND_LBS = 1.5;
const MIN_WEIGHINS_FOR_TREND = 5;

/** Toast copy that read what you just logged — always kind, never invented. */

export function weightReply(data: AppData, entry: WeightEntry): string {
  const previous = data.weights.filter((w) => w.id !== entry.id);
  if (isNewLow(previous, entry)) {
    return `New low: ${fmtWeight(entry.lbs, data.settings.unit)} — quietly amazing 📉`;
  }
  const trend = previous.length >= MIN_WEIGHINS_FOR_TREND ? trendWeightLbs({ ...data, weights: previous }, entry.ts) : undefined;
  if (trend != null && entry.lbs - trend >= JUMP_ABOVE_TREND_LBS) {
    return `${fmtWeekday(entry.ts)} jump — a one-day rise over your trend is almost always water, not fat. The 7-day line tells the truth ⚖️`;
  }
  return "Weight logged ⚖️";
}

export function shotReply(data: AppData, shot: Shot): string {
  const run = streak([...data.shots.filter((s) => s.id !== shot.id), shot], data.settings.scheduleDays);
  return run >= 2 ? `Done — ${run} in a row, right on time 💜` : "Shot logged 💪";
}

export function effectReply(data: AppData, entry: EffectEntry): string {
  if (isFeelingFine(entry)) return "Logged — here's to more days like this 💛";
  if (entry.severity === 3) return "That sounds rough. Be gentle with yourself tonight 💛";
  const offset = cycleOffsetDays(entry.ts, data.shots);
  const buckets = effectTimingBuckets(data);
  const peak = buckets.length ? buckets.reduce((a, b) => (b.count > a.count ? b : a)) : undefined;
  if (offset != null && peak && peak.count >= 2 && offset === peak.offsetDays) {
    return "Noted — right on your usual pattern, and it fades 💛";
  }
  return "Noted — hope you feel better soon 💛";
}

/** Celebrates the logging habit, never the number — some days run low, some high, and that's the med working. */
export function calorieReply(data: AppData, now = Date.now()): string {
  const logged = new Set(data.intake.filter((i) => (i.kcal ?? 0) > 0).map((i) => i.day));
  logged.add(startOfDay(now));
  let run = 0;
  // step to the previous local midnight (not −24h flat) so DST changeovers don't break the run
  for (let day = startOfDay(now); logged.has(day); day = startOfDay(day - DAY / 2)) run++;
  return run >= 2 ? `Fuel logged — day ${run} in a row 📒` : "Fuel logged 📒";
}

export function activityReply(data: AppData, entry: ActivityEntry): string {
  const others = data.activities.filter((a) => a.id !== entry.id);
  if (isLongestYet(others, entry)) return `Longest one yet — ${entry.minutes} minutes 👟`;
  return "Nice moving! 🏃";
}
