import type { AppData, MeasureKey, WeightEntry } from "../../types";
import { DAY } from "../dates";
import { MEASURES, measureSeries } from "../measures";
import { sortedWeights } from "../weight";

export interface TapeVsScale {
  measureKey: MeasureKey;
  measureLabel: string;
  inchesChange: number;
  lbsChange: number;
  /** pounds lost per inch lost, when both moved */
  lbsPerInch?: number;
  recentInches: number;
  recentLbs?: number;
  scaleFlatTapeMoving: boolean;
}

const MIN_SPAN_DAYS = 14;
const NEAREST_WINDOW_DAYS = 7;
const RECENT_DAYS = 28;
const FLAT_LBS = 1.0;
const TAPE_MOVE_IN = 0.3;

function nearestWeight(weights: WeightEntry[], ts: number): number | undefined {
  let best: WeightEntry | undefined;
  for (const w of weights) {
    if (Math.abs(w.ts - ts) > NEAREST_WINDOW_DAYS * DAY) continue;
    if (!best || Math.abs(w.ts - ts) < Math.abs(best.ts - ts)) best = w;
  }
  return best?.lbs;
}

/** The tape measure's story next to the scale's — often the more encouraging one. */
export function tapeVsScale(data: AppData, now = Date.now()): TapeVsScale | undefined {
  const order: MeasureKey[] = ["waist", ...MEASURES.map((m) => m.key).filter((k) => k !== "waist")];
  const key = order.find((k) => measureSeries(data.measures, k).length >= 2);
  if (!key) return undefined;

  const series = measureSeries(data.measures, key);
  const first = series[0];
  const last = series.at(-1)!;
  const prev = series.at(-2)!;
  if (last.ts - first.ts < MIN_SPAN_DAYS * DAY) return undefined;

  const weights = sortedWeights(data.weights);
  const lbsAtFirst = nearestWeight(weights, first.ts);
  const lbsAtLast = nearestWeight(weights, last.ts);
  if (lbsAtFirst == null || lbsAtLast == null) return undefined;

  const inchesChange = last.inches - first.inches;
  const lbsChange = lbsAtLast - lbsAtFirst;
  const lbsAtPrev = nearestWeight(weights, prev.ts);
  const recentInches = last.inches - prev.inches;
  const recentLbs = lbsAtPrev != null ? lbsAtLast - lbsAtPrev : undefined;
  const isRecent = now - last.ts <= RECENT_DAYS * DAY;

  return {
    measureKey: key,
    measureLabel: MEASURES.find((m) => m.key === key)!.label,
    inchesChange,
    lbsChange,
    lbsPerInch: inchesChange <= -0.2 && lbsChange < 0 ? lbsChange / inchesChange : undefined,
    recentInches,
    recentLbs,
    scaleFlatTapeMoving: isRecent && recentLbs != null && Math.abs(recentLbs) < FLAT_LBS && recentInches <= -TAPE_MOVE_IN,
  };
}
