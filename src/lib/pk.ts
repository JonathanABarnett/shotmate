import type { Shot } from "../types";
import { DAY, HOUR } from "./dates";

/** Slow subcutaneous absorption ramp shared by the weekly GLP-1s. */
const ABSORPTION_HALF_H = 24;
const WASHED_OUT_HALF_LIVES = 12;

function singleShotLevel(shot: Shot, t: number, halfLifeH: number): number {
  const h = (t - shot.ts) / HOUR;
  if (h < 0 || h / halfLifeH > WASHED_OUT_HALF_LIVES) return 0;
  const absorbed = 1 - Math.pow(0.5, h / ABSORPTION_HALF_H);
  const remaining = Math.pow(0.5, h / halfLifeH);
  return shot.doseMg * absorbed * remaining;
}

/**
 * Estimated relative amount of medication in the body at time t, summed over
 * shots. A visualization aid — not medical guidance.
 */
export function levelAt(t: number, shots: Shot[], halfLifeH: number): number {
  return shots.reduce((sum, s) => sum + singleShotLevel(s, t, halfLifeH), 0);
}

export interface LevelPoint {
  ts: number;
  past: number | null;
  future: number | null;
}

function toLevelPoint(ts: number, now: number, shots: Shot[], halfLifeH: number): LevelPoint {
  const v = levelAt(ts, shots, halfLifeH);
  return { ts, past: ts <= now ? v : null, future: ts >= now ? v : null };
}

/** Level curve from just before the first shot through the next due date. */
export function levelSeries(shots: Shot[], halfLifeH: number, scheduleDays: number, now = Date.now()): LevelPoint[] {
  if (shots.length === 0) return [];
  const sorted = [...shots].sort((a, b) => a.ts - b.ts);
  const start = Math.max(sorted[0].ts - DAY, now - 90 * DAY);
  const end = Math.max(now, sorted[sorted.length - 1].ts + scheduleDays * DAY) + DAY;
  const step = Math.max(HOUR * 3, (end - start) / 240);

  const points: LevelPoint[] = [];
  for (let t = start; t <= end; t += step) {
    points.push(toLevelPoint(t, now, sorted, halfLifeH));
  }
  // "now" must be an exact datapoint so the past and future series join seamlessly.
  points.push(toLevelPoint(now, now, sorted, halfLifeH));
  return points.sort((a, b) => a.ts - b.ts);
}
