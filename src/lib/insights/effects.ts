import type { AppData } from "../../types";
import { symptomEntries } from "../effects";
import { cycleOffsetDays, offsetLabel } from "./shared";

export interface TimingBucket {
  offsetDays: number;
  label: string;
  count: number;
}

/** How side-effect entries cluster around shot day. */
export function effectTimingBuckets(data: AppData): TimingBucket[] {
  const symptoms = symptomEntries(data.effects);
  if (data.shots.length === 0 || symptoms.length === 0) return [];
  const span = Math.min(data.settings.scheduleDays, 14);
  const counts = new Array<number>(span).fill(0);
  for (const effect of symptoms) {
    const offset = cycleOffsetDays(effect.ts, data.shots);
    if (offset != null && offset < span) counts[offset]++;
  }
  return counts.map((count, offsetDays) => ({ offsetDays, label: offsetLabel(offsetDays), count }));
}

/** One line of friendly narrative, or nothing when the data is too thin. */
export function effectTimingSummary(buckets: TimingBucket[]): string | undefined {
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  if (total < 3) return undefined;
  const peak = buckets.reduce((a, b) => (b.count > a.count ? b : a));
  if (peak.count / total < 0.34) return "Your side effects are pretty evenly spread across the week.";
  const when = peak.offsetDays === 0 ? "on shot day itself" : peak.label.toLowerCase();
  return `Most of your side effects show up ${when} — handy for planning easy days.`;
}
