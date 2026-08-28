import type { AppData } from "../../types";
import { DAY } from "../dates";
import { mean } from "./shared";

export interface TrendCheck {
  /** mean of the last 7 days of weigh-ins */
  trendLbs: number;
  /** vs. the mean of the 7 days before that (negative = losing) */
  weeklyChangeLbs: number;
  /** latest reading minus the one before it */
  lastBlipLbs: number;
  /** the latest reading ticked up while the weekly trend points down */
  reassure: boolean;
}

const MIN_WEIGHINS = 6;
const MIN_THIS_WEEK = 3;
const MIN_LAST_WEEK = 2;
const BLIP = 0.5;

/** The 7-day average vs. this morning's number — the anti-anxiety view of daily weighing. */
export function trendVsToday(data: AppData, now = Date.now()): TrendCheck | undefined {
  const sorted = [...data.weights].sort((a, b) => a.ts - b.ts);
  if (sorted.length < MIN_WEIGHINS) return undefined;
  const lbsIn = (from: number, to: number) => sorted.filter((w) => w.ts >= from && w.ts < to).map((w) => w.lbs);
  const thisWeek = lbsIn(now - 7 * DAY, now + 1);
  const lastWeek = lbsIn(now - 14 * DAY, now - 7 * DAY);
  if (thisWeek.length < MIN_THIS_WEEK || lastWeek.length < MIN_LAST_WEEK) return undefined;

  const trendLbs = mean(thisWeek)!;
  const weeklyChangeLbs = trendLbs - mean(lastWeek)!;
  const lastBlipLbs = sorted[sorted.length - 1].lbs - sorted[sorted.length - 2].lbs;
  return { trendLbs, weeklyChangeLbs, lastBlipLbs, reassure: lastBlipLbs >= BLIP && weeklyChangeLbs <= -BLIP };
}

/** The trend's current value: mean of the last 7 days of weigh-ins, or the latest reading before there are two. */
export function trendWeightLbs(data: AppData, now = Date.now()): number | undefined {
  const recent = data.weights.filter((w) => w.ts >= now - 7 * DAY && w.ts <= now + 1).map((w) => w.lbs);
  if (recent.length >= 2) return mean(recent);
  return [...data.weights].sort((a, b) => a.ts - b.ts).at(-1)?.lbs;
}
