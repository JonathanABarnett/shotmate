import type { AppData } from "../../types";
import { DAY, HOUR } from "../dates";
import { sortedShots } from "../shots";
import { mean } from "./shared";

export interface Adherence {
  gaps: number;
  onTimeRate: number;
  /** average hours late (positive) or early (negative) vs. the schedule */
  avgDriftHours: number;
  weighInsPerWeek: number;
}

const MIN_SHOTS = 3;
const ON_TIME_TOLERANCE_H = 24;
const WEIGH_IN_WINDOW_DAYS = 28;

/** How consistently shots land on schedule, plus weigh-in cadence. */
export function adherenceStats(data: AppData, now = Date.now()): Adherence | undefined {
  const shots = sortedShots(data.shots);
  if (shots.length < MIN_SHOTS) return undefined;

  const scheduleMs = data.settings.scheduleDays * DAY;
  const drifts = shots.slice(1).map((s, i) => (s.ts - shots[i].ts - scheduleMs) / HOUR);
  const onTime = drifts.filter((d) => Math.abs(d) <= ON_TIME_TOLERANCE_H).length;
  const recentWeighIns = data.weights.filter((w) => w.ts >= now - WEIGH_IN_WINDOW_DAYS * DAY).length;

  return {
    gaps: drifts.length,
    onTimeRate: onTime / drifts.length,
    avgDriftHours: mean(drifts) ?? 0,
    weighInsPerWeek: recentWeighIns / (WEIGH_IN_WINDOW_DAYS / 7),
  };
}
