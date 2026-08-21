import type { AppData } from "../types";
import { DAY } from "./dates";
import { slopeLbsPerWeek, sortedWeights } from "./weight";
import { sortedShots } from "./shots";

/* ------------------------ side effects vs. shot timing ------------------------ */

export interface TimingBucket {
  offsetDays: number;
  label: string;
  count: number;
}

function offsetLabel(days: number): string {
  if (days === 0) return "Shot day";
  if (days === 1) return "1 day after";
  return `${days} days after`;
}

/** How side-effect entries cluster around shot day. */
export function effectTimingBuckets(data: AppData): TimingBucket[] {
  const shots = sortedShots(data.shots);
  if (shots.length === 0 || data.effects.length === 0) return [];

  const span = Math.min(data.settings.scheduleDays, 14);
  const counts = new Array<number>(span).fill(0);
  for (const effect of data.effects) {
    const lastShot = [...shots].reverse().find((s) => s.ts <= effect.ts);
    if (!lastShot) continue;
    const offset = Math.floor((effect.ts - lastShot.ts) / DAY);
    if (offset >= 0 && offset < span) counts[offset]++;
  }
  return counts.map((count, offsetDays) => ({ offsetDays, label: offsetLabel(offsetDays), count }));
}

/** One line of friendly narrative, or nothing when the data's too thin. */
export function effectTimingSummary(buckets: TimingBucket[]): string | undefined {
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  if (total < 3) return undefined;
  const peak = buckets.reduce((a, b) => (b.count > a.count ? b : a));
  if (peak.count / total < 0.34) return "Your side effects are pretty evenly spread across the week.";
  const when = peak.offsetDays === 0 ? "on shot day itself" : peak.label.toLowerCase();
  return `Most of your side effects show up ${when} — handy for planning easy days.`;
}

/* ------------------------------ pace at each dose ----------------------------- */

export interface DosePace {
  doseMg: number;
  lbsPerWeek: number;
  weeks: number;
}

const MIN_SEGMENT_DAYS = 14;
const MIN_WEIGH_INS = 4;

/** Average weekly weight change while on each dose (longest-held doses only). */
export function paceByDose(data: AppData): DosePace[] {
  const shots = sortedShots(data.shots);
  const weights = sortedWeights(data.weights);
  if (shots.length === 0 || weights.length < MIN_WEIGH_INS) return [];

  // Consecutive same-dose runs → [doseMg, startTs, endTs]
  const segments: { doseMg: number; start: number; end: number }[] = [];
  for (const shot of shots) {
    const last = segments.at(-1);
    if (last && last.doseMg === shot.doseMg) last.end = shot.ts;
    else segments.push({ doseMg: shot.doseMg, start: shot.ts, end: shot.ts });
  }
  const lastSegment = segments.at(-1);
  if (lastSegment) lastSegment.end = Date.now();

  return segments.flatMap((seg) => {
    if (seg.end - seg.start < MIN_SEGMENT_DAYS * DAY) return [];
    const pts = weights.filter((w) => w.ts >= seg.start && w.ts <= seg.end);
    const slope = slopeLbsPerWeek(pts);
    if (pts.length < MIN_WEIGH_INS || slope == null) return [];
    return [{ doseMg: seg.doseMg, lbsPerWeek: slope, weeks: Math.round((seg.end - seg.start) / (7 * DAY)) }];
  });
}
