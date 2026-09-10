import type { AppData } from "../types";
import { DAY } from "./dates";
import { trendWeightLbs } from "./insights/noiseTrend";
import { slopeLbsPerWeek, sortedWeights, weeklyRate } from "./weight";

export interface Forecast {
  targetTs: number;
  weeks: number;
  trendLbs: number;
  /** lbs per week over the last 4 weeks — negative while losing */
  recentRate: number;
  /** lbs per week across every weigh-in */
  overallRate: number;
  atRecent: number;
  atOverall: number;
  /** when the trend reaches the goal at each pace — undefined unless it's falling */
  goalAtRecentTs?: number;
  goalAtOverallTs?: number;
}

const MIN_WEIGHINS = 6;
const MIN_SPAN_DAYS = 14;
const RECENT_WINDOW_DAYS = 28;
const WEEK = 7 * DAY;

/** Straight-line projection of the 7-day trend to a date, at the recent pace and the overall pace. */
export function forecast(data: AppData, targetTs: number, now = Date.now()): Forecast | undefined {
  const sorted = sortedWeights(data.weights);
  if (sorted.length < MIN_WEIGHINS || sorted[sorted.length - 1].ts - sorted[0].ts < MIN_SPAN_DAYS * DAY) return undefined;
  const trendLbs = trendWeightLbs(data, now);
  const recentRate = weeklyRate(data.weights, RECENT_WINDOW_DAYS);
  const overallRate = slopeLbsPerWeek(sorted);
  if (trendLbs == null || recentRate == null || overallRate == null) return undefined;

  const weeks = (targetTs - now) / WEEK;
  const goal = data.settings.goalLbs;
  const goalEta = (rate: number) => (rate < 0 && goal != null && trendLbs > goal ? now + ((trendLbs - goal) / -rate) * WEEK : undefined);
  return {
    targetTs,
    weeks,
    trendLbs,
    recentRate,
    overallRate,
    atRecent: trendLbs + recentRate * weeks,
    atOverall: trendLbs + overallRate * weeks,
    goalAtRecentTs: goalEta(recentRate),
    goalAtOverallTs: goalEta(overallRate),
  };
}
