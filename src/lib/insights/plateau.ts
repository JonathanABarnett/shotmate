import type { AppData } from "../../types";
import { DAY } from "../dates";
import { slopeLbsPerWeek, sortedWeights } from "../weight";
import { doseSegments } from "./dosePace";

export type PaceKind = "plateau" | "slowing" | "accelerating" | "steady";

export interface PaceShift {
  kind: PaceKind;
  recentRate: number;
  priorRate?: number;
  weeksOnDose: number;
}

const MIN_WEIGH_INS = 9;
const MIN_SPAN_DAYS = 21;
const WINDOW_DAYS = 21;
const FLAT_RATE = 0.35;
const SHIFT_RATE = 0.6;

/** Has the pace changed? Plateau, slowing, accelerating, or steady. */
export function paceShift(data: AppData, now = Date.now()): PaceShift | undefined {
  const weights = sortedWeights(data.weights);
  if (weights.length < MIN_WEIGH_INS) return undefined;
  if (weights.at(-1)!.ts - weights[0].ts < MIN_SPAN_DAYS * DAY) return undefined;

  const inRange = (from: number, to: number) => weights.filter((w) => w.ts >= from && w.ts < to);
  const recentRate = slopeLbsPerWeek(inRange(now - WINDOW_DAYS * DAY, now + 1));
  if (recentRate == null) return undefined;
  const priorRate = slopeLbsPerWeek(inRange(now - 2 * WINDOW_DAYS * DAY, now - WINDOW_DAYS * DAY));
  const last14 = inRange(now - 14 * DAY, now + 1);
  const flatRate = last14.length >= 5 ? slopeLbsPerWeek(last14) : undefined;

  const currentSegment = doseSegments(data.shots, now).at(-1);
  const weeksOnDose = currentSegment ? Math.round((now - currentSegment.start) / (7 * DAY)) : 0;

  let kind: PaceKind = "steady";
  if (flatRate != null && Math.abs(flatRate) < FLAT_RATE && priorRate != null && priorRate < -0.5) kind = "plateau";
  else if (priorRate != null && recentRate - priorRate >= SHIFT_RATE) kind = "slowing";
  else if (priorRate != null && priorRate - recentRate >= SHIFT_RATE) kind = "accelerating";

  return { kind, recentRate, priorRate, weeksOnDose };
}
