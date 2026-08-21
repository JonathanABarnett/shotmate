import type { AppData } from "../../types";
import { DAY } from "../dates";
import { sortedShots } from "../shots";
import { mean } from "./shared";

export interface DoseStepEffects {
  increases: number;
  windowDays: number;
  postRatePerWeek: number;
  otherRatePerWeek: number;
  postSeverity?: number;
  otherSeverity?: number;
}

const WINDOW_DAYS = 14;
const MIN_EFFECTS = 3;

/** Side-effect rate in the two weeks after each dose increase vs. the rest of the time. */
export function doseStepEffects(data: AppData, now = Date.now()): DoseStepEffects | undefined {
  const shots = sortedShots(data.shots);
  if (shots.length < 2 || data.effects.length < MIN_EFFECTS) return undefined;

  const windows = shots
    .filter((s, i) => i > 0 && s.doseMg > shots[i - 1].doseMg)
    .map((s) => ({ from: s.ts, to: Math.min(s.ts + WINDOW_DAYS * DAY, now) }));
  if (windows.length === 0) return undefined;

  const inWindow = (ts: number) => windows.some((w) => ts >= w.from && ts < w.to);
  const post = data.effects.filter((e) => inWindow(e.ts));
  const other = data.effects.filter((e) => !inWindow(e.ts));

  const postWeeks = windows.reduce((sum, w) => sum + (w.to - w.from), 0) / (7 * DAY);
  const otherWeeks = (now - shots[0].ts) / (7 * DAY) - postWeeks;
  if (postWeeks <= 0 || otherWeeks <= 0) return undefined;

  return {
    increases: windows.length,
    windowDays: WINDOW_DAYS,
    postRatePerWeek: post.length / postWeeks,
    otherRatePerWeek: other.length / otherWeeks,
    postSeverity: mean(post.map((e) => e.severity)),
    otherSeverity: mean(other.map((e) => e.severity)),
  };
}
