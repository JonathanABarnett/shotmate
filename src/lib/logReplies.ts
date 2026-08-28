import type { ActivityEntry, AppData, EffectEntry, Shot, WeightEntry } from "../types";
import { isFeelingFine } from "./effects";
import { effectTimingBuckets } from "./insights";
import { cycleOffsetDays } from "./insights/shared";
import { streak } from "./shots";
import { fmtWeight } from "./weight";

/** Toast copy that read what you just logged — always kind, never invented. */

export function weightReply(data: AppData, entry: WeightEntry): string {
  const previous = data.weights.filter((w) => w.id !== entry.id);
  if (previous.length >= 3 && entry.lbs < Math.min(...previous.map((w) => w.lbs))) {
    return `New low: ${fmtWeight(entry.lbs, data.settings.unit)} — quietly amazing 📉`;
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

export function activityReply(data: AppData, entry: ActivityEntry): string {
  const others = data.activities.filter((a) => a.id !== entry.id);
  const best = Math.max(0, ...others.map((a) => a.minutes));
  if (entry.minutes >= 20 && entry.minutes > best) return `Longest one yet — ${entry.minutes} minutes 👟`;
  return "Nice moving! 🏃";
}
