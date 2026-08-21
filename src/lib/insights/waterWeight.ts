import type { AppData } from "../../types";
import { movingAverage, sortedWeights } from "../weight";
import { cycleOffsetDays, mean } from "./shared";

export interface ShotDayBump {
  /** mean deviation from trend for weigh-ins right after a shot (days 0–2) */
  earlyAvg: number;
  /** mean deviation from trend for weigh-ins late in the cycle */
  lateAvg: number;
  diffLbs: number;
  nEarly: number;
  nLate: number;
  lateFromDay: number;
}

const MIN_PER_GROUP = 6;
const EARLY_LAST_DAY = 2;
const MIN_SCHEDULE_DAYS = 5;

/** Do weigh-ins run heavier right after a shot than at the end of the cycle? */
export function shotDayBump(data: AppData): ShotDayBump | undefined {
  const schedule = data.settings.scheduleDays;
  if (schedule < MIN_SCHEDULE_DAYS || data.shots.length < 2) return undefined;
  const weights = sortedWeights(data.weights);
  const trend = movingAverage(weights);
  const lateFromDay = Math.max(EARLY_LAST_DAY + 1, schedule - 3);

  const early: number[] = [];
  const late: number[] = [];
  weights.forEach((w, i) => {
    const offset = cycleOffsetDays(w.ts, data.shots);
    if (offset == null) return;
    const residual = w.lbs - trend[i].lbs;
    if (offset <= EARLY_LAST_DAY) early.push(residual);
    else if (offset >= lateFromDay && offset < schedule) late.push(residual);
  });
  if (early.length < MIN_PER_GROUP || late.length < MIN_PER_GROUP) return undefined;

  const earlyAvg = mean(early)!;
  const lateAvg = mean(late)!;
  return { earlyAvg, lateAvg, diffLbs: earlyAvg - lateAvg, nEarly: early.length, nLate: late.length, lateFromDay };
}
