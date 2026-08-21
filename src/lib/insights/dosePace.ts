import type { AppData, Shot } from "../../types";
import { DAY } from "../dates";
import { sortedShots } from "../shots";
import { slopeLbsPerWeek, sortedWeights } from "../weight";

export interface DoseSegment {
  doseMg: number;
  start: number;
  end: number;
}

/** Consecutive same-dose runs; the last one extends to now. */
export function doseSegments(shots: Shot[], now = Date.now()): DoseSegment[] {
  const segments: DoseSegment[] = [];
  for (const shot of sortedShots(shots)) {
    const last = segments.at(-1);
    if (last && last.doseMg === shot.doseMg) last.end = shot.ts;
    else segments.push({ doseMg: shot.doseMg, start: shot.ts, end: shot.ts });
  }
  const last = segments.at(-1);
  if (last) last.end = now;
  return segments;
}

export interface DosePace {
  doseMg: number;
  lbsPerWeek: number;
  weeks: number;
}

const MIN_SEGMENT_DAYS = 14;
const MIN_WEIGH_INS = 4;

/** Average weekly weight change while on each dose (longest-held doses only). */
export function paceByDose(data: AppData): DosePace[] {
  const weights = sortedWeights(data.weights);
  if (data.shots.length === 0 || weights.length < MIN_WEIGH_INS) return [];

  return doseSegments(data.shots).flatMap((seg) => {
    if (seg.end - seg.start < MIN_SEGMENT_DAYS * DAY) return [];
    const pts = weights.filter((w) => w.ts >= seg.start && w.ts <= seg.end);
    const slope = slopeLbsPerWeek(pts);
    if (pts.length < MIN_WEIGH_INS || slope == null) return [];
    return [{ doseMg: seg.doseMg, lbsPerWeek: slope, weeks: Math.round((seg.end - seg.start) / (7 * DAY)) }];
  });
}
