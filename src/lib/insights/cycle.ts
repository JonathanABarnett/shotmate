import type { AppData, WeightEntry } from "../../types";
import { DAY, startOfDay } from "../dates";
import { proteinGoal } from "../intake";
import { sortedShots } from "../shots";
import { sortedWeights } from "../weight";

export interface CycleReview {
  cycleStart: number;
  daysIn: number;
  weightChangeLbs?: number;
  prevWeightChangeLbs?: number;
  activeMinutes: number;
  prevActiveMinutes?: number;
  proteinDaysHit: number;
  proteinDaysTracked: number;
  effectCount: number;
  prevEffectCount?: number;
  winCount: number;
}

/** Weight change across [from, to): last weigh-in inside vs. the last one before it. */
function weightChangeIn(weights: WeightEntry[], from: number, to: number): number | undefined {
  const sorted = sortedWeights(weights);
  const inside = sorted.filter((w) => w.ts >= from && w.ts < to);
  const last = inside.at(-1);
  if (!last) return undefined;
  const base = sorted.filter((w) => w.ts < from).at(-1) ?? inside[0];
  return base === last ? undefined : last.lbs - base.lbs;
}

const within = <T extends { ts: number }>(items: T[], from: number, to: number) =>
  items.filter((i) => i.ts >= from && i.ts < to);

const minutesOf = (items: { minutes: number }[]) => items.reduce((s, a) => s + a.minutes, 0);

/** Everything that happened since the last shot, with the previous cycle for contrast. */
export function cycleReview(data: AppData, now = Date.now()): CycleReview | undefined {
  const shots = sortedShots(data.shots);
  if (shots.length === 0) return undefined;
  const start = shots.at(-1)!.ts;
  const prevStart = shots.at(-2)?.ts;
  const end = now + 1;

  const goal = proteinGoal(data);
  const intakeDays = data.intake.filter((i) => i.day >= startOfDay(start) && i.day <= startOfDay(now));

  return {
    cycleStart: start,
    daysIn: Math.floor((now - start) / DAY),
    weightChangeLbs: weightChangeIn(data.weights, start, end),
    prevWeightChangeLbs: prevStart != null ? weightChangeIn(data.weights, prevStart, start) : undefined,
    activeMinutes: minutesOf(within(data.activities, start, end)),
    prevActiveMinutes: prevStart != null ? minutesOf(within(data.activities, prevStart, start)) : undefined,
    proteinDaysHit: intakeDays.filter((i) => i.proteinG >= goal).length,
    proteinDaysTracked: intakeDays.length,
    effectCount: within(data.effects, start, end).length,
    prevEffectCount: prevStart != null ? within(data.effects, prevStart, start).length : undefined,
    winCount: within(data.wins, start, end).length,
  };
}
