import type { AppData, Unit, WeightEntry } from "../types";
import { DAY } from "./dates";

export const LBS_PER_KG = 2.2046226218;

export function toDisplayWeight(lbs: number, unit: Unit): number {
  return unit === "kg" ? lbs / LBS_PER_KG : lbs;
}

export function fromDisplayWeight(value: number, unit: Unit): number {
  return unit === "kg" ? value * LBS_PER_KG : value;
}

export function fmtWeight(lbs: number, unit: Unit, withUnit = true): string {
  const v = toDisplayWeight(lbs, unit);
  const s = (Math.round(v * 10) / 10).toLocaleString(undefined, { maximumFractionDigits: 1 });
  return withUnit ? `${s} ${unit}` : s;
}

export function sortedWeights(weights: WeightEntry[]): WeightEntry[] {
  return [...weights].sort((a, b) => a.ts - b.ts);
}

export function latestWeight(weights: WeightEntry[]): WeightEntry | undefined {
  return sortedWeights(weights).at(-1);
}

export function startWeightLbs(data: AppData): number | undefined {
  return data.settings.startLbs ?? sortedWeights(data.weights)[0]?.lbs;
}

/** Trailing moving average over ~windowDays, evaluated at each entry. */
export function movingAverage(weights: WeightEntry[], windowDays = 7): { ts: number; lbs: number }[] {
  const sorted = sortedWeights(weights);
  return sorted.map((w, i) => {
    let sum = 0;
    let n = 0;
    for (let j = i; j >= 0 && w.ts - sorted[j].ts <= windowDays * DAY; j--) {
      sum += sorted[j].lbs;
      n++;
    }
    return { ts: w.ts, lbs: sum / n };
  });
}

/** Least-squares slope of a set of weigh-ins, in lbs per week. */
export function slopeLbsPerWeek(pts: WeightEntry[]): number | undefined {
  if (pts.length < 3) return undefined;
  const xs = pts.map((p) => (p.ts - pts[0].ts) / (7 * DAY));
  const ys = pts.map((p) => p.lbs);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let num = 0;
  let den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den === 0 ? undefined : num / den;
}

/** Slope over the last `days` days, in lbs per week. */
export function weeklyRate(weights: WeightEntry[], days = 28): number | undefined {
  const cutoff = Date.now() - days * DAY;
  return slopeLbsPerWeek(sortedWeights(weights).filter((w) => w.ts >= cutoff));
}

export function bmi(lbs: number, heightIn?: number): number | undefined {
  if (!heightIn || heightIn <= 0) return undefined;
  return (703 * lbs) / (heightIn * heightIn);
}

export interface GoalProgress {
  pct: number;
  lostLbs: number;
  toGoLbs: number;
}

export function goalProgress(data: AppData): GoalProgress | undefined {
  const start = startWeightLbs(data);
  const current = latestWeight(data.weights)?.lbs;
  const goal = data.settings.goalLbs;
  if (start == null || current == null || goal == null || start <= goal) return undefined;
  const lost = start - current;
  return {
    pct: Math.max(0, Math.min(1, lost / (start - goal))),
    lostLbs: lost,
    toGoLbs: Math.max(0, current - goal),
  };
}
