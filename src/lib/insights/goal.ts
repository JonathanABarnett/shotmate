import type { AppData } from "../../types";
import { DAY } from "../dates";
import { latestWeight, startWeightLbs, weeklyRate } from "../weight";

export interface GoalOutlook {
  lostLbs: number;
  pctLost: number;
  reachedMarks: number[];
  nextPctMark?: number;
  toNextPctLbs?: number;
  nextMilestoneLbs: number;
  toNextMilestoneLbs: number;
  ratePerWeek?: number;
  etaMilestoneTs?: number;
  etaGoalTs?: number;
}

const PCT_MARKS = [5, 10, 15, 20, 25, 30];
const MILESTONE_STEP_LBS = 5;
const MIN_RATE = 0.2;

/** Milestones reached, the next ones, and when you'd hit them at your recent pace. */
export function goalOutlook(data: AppData, now = Date.now()): GoalOutlook | undefined {
  const start = startWeightLbs(data);
  const current = latestWeight(data.weights)?.lbs;
  if (start == null || current == null) return undefined;
  const lostLbs = start - current;
  if (lostLbs <= 0) return undefined;

  const pctLost = (lostLbs / start) * 100;
  const nextPctMark = PCT_MARKS.find((m) => m > pctLost);
  const nextMilestoneLbs = (Math.floor(lostLbs / MILESTONE_STEP_LBS) + 1) * MILESTONE_STEP_LBS;
  const toNextMilestoneLbs = nextMilestoneLbs - lostLbs;

  const rate = weeklyRate(data.weights, 28);
  const etaFor = (lbs: number) => (rate != null && rate < -MIN_RATE ? now + (lbs / -rate) * 7 * DAY : undefined);
  const goal = data.settings.goalLbs;

  return {
    lostLbs,
    pctLost,
    reachedMarks: PCT_MARKS.filter((m) => m <= pctLost),
    nextPctMark,
    toNextPctLbs: nextPctMark != null ? (start * nextPctMark) / 100 - lostLbs : undefined,
    nextMilestoneLbs,
    toNextMilestoneLbs,
    ratePerWeek: rate,
    etaMilestoneTs: etaFor(toNextMilestoneLbs),
    etaGoalTs: goal != null && current > goal ? etaFor(current - goal) : undefined,
  };
}
