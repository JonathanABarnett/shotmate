import type { AppData } from "../../types";
import { weekStart } from "../activity";
import { DAY } from "../dates";
import { sortedWeights } from "../weight";
import { mean } from "./shared";

export interface PaceGroup {
  weeks: number;
  avgChangeLbs: number;
}

export interface ActivityPace {
  thresholdMinutes: number;
  active: PaceGroup;
  quiet: PaceGroup;
}

const ACTIVE_THRESHOLD_MIN = 90;
const MIN_WEEKS_PER_GROUP = 2;
const MIN_WEIGH_INS_PER_WEEK = 2;

/** Weekly weight change in weeks you moved a lot vs. weeks you didn't. */
export function activityVsPace(data: AppData): ActivityPace | undefined {
  const byWeek = new Map<number, number[]>();
  for (const w of sortedWeights(data.weights)) {
    const key = weekStart(w.ts);
    byWeek.set(key, [...(byWeek.get(key) ?? []), w.lbs]);
  }
  const weekAvg = new Map<number, number>();
  for (const [key, lbs] of byWeek) {
    if (lbs.length >= MIN_WEIGH_INS_PER_WEEK) weekAvg.set(key, mean(lbs)!);
  }

  const minutesByWeek = new Map<number, number>();
  for (const a of data.activities) {
    const key = weekStart(a.ts);
    minutesByWeek.set(key, (minutesByWeek.get(key) ?? 0) + a.minutes);
  }

  const active: number[] = [];
  const quiet: number[] = [];
  for (const [key, avg] of weekAvg) {
    const prevAvg = weekAvg.get(key - 7 * DAY);
    if (prevAvg == null) continue;
    const change = avg - prevAvg;
    ((minutesByWeek.get(key) ?? 0) >= ACTIVE_THRESHOLD_MIN ? active : quiet).push(change);
  }
  if (active.length < MIN_WEEKS_PER_GROUP || quiet.length < MIN_WEEKS_PER_GROUP) return undefined;

  return {
    thresholdMinutes: ACTIVE_THRESHOLD_MIN,
    active: { weeks: active.length, avgChangeLbs: mean(active)! },
    quiet: { weeks: quiet.length, avgChangeLbs: mean(quiet)! },
  };
}
