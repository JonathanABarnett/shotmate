import type { AppData } from "../../types";
import { DAY } from "../dates";
import { mean } from "./shared";

export interface WeekCompare {
  /** negative rates = losing */
  weight?: { thisRateLbs: number; priorRateLbs?: number };
  activity?: { minutes: number; sessions: number; priorMinutes: number; priorSessions: number };
}

const MIN_THIS_WEEK = 3;
const MIN_PRIOR_WEEK = 2;

/** This rolling week vs the one before — scale rate and movement side by side. */
export function weekOverWeek(data: AppData, now = Date.now()): WeekCompare | undefined {
  const weightsIn = (from: number, to: number) => data.weights.filter((w) => w.ts >= from && w.ts < to).map((w) => w.lbs);
  const w1 = weightsIn(now - 7 * DAY, now + 1);
  const w2 = weightsIn(now - 14 * DAY, now - 7 * DAY);
  const w3 = weightsIn(now - 21 * DAY, now - 14 * DAY);
  const weight =
    w1.length >= MIN_THIS_WEEK && w2.length >= MIN_PRIOR_WEEK
      ? {
          thisRateLbs: mean(w1)! - mean(w2)!,
          priorRateLbs: w3.length >= MIN_PRIOR_WEEK ? mean(w2)! - mean(w3)! : undefined,
        }
      : undefined;

  const actIn = (from: number, to: number) => data.activities.filter((a) => a.ts >= from && a.ts < to);
  const a1 = actIn(now - 7 * DAY, now + 1);
  const a2 = actIn(now - 14 * DAY, now - 7 * DAY);
  const activity =
    a1.length + a2.length > 0
      ? {
          minutes: a1.reduce((s, a) => s + a.minutes, 0),
          sessions: a1.length,
          priorMinutes: a2.reduce((s, a) => s + a.minutes, 0),
          priorSessions: a2.length,
        }
      : undefined;

  // without a prior-week rate or any movement, this card would just repeat the trend card
  if (!activity && weight?.priorRateLbs == null) return undefined;
  return { weight, activity };
}
