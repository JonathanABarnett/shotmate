import type { MeasureKey, MeasurementEntry, Unit } from "../types";

export const CM_PER_IN = 2.54;

export interface MeasureInfo {
  key: MeasureKey;
  label: string;
}

export const MEASURES: MeasureInfo[] = [
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "arm", label: "Arm" },
  { key: "thigh", label: "Thigh" },
];

/** Tape-measure unit follows the weight unit: lbs pairs with inches, kg with cm. */
export function lengthUnit(unit: Unit): "in" | "cm" {
  return unit === "lbs" ? "in" : "cm";
}

export function toDisplayLength(inches: number, unit: Unit): number {
  return unit === "lbs" ? inches : inches * CM_PER_IN;
}

export function fromDisplayLength(value: number, unit: Unit): number {
  return unit === "lbs" ? value : value / CM_PER_IN;
}

export function fmtLength(inches: number, unit: Unit): string {
  return (Math.round(toDisplayLength(inches, unit) * 10) / 10).toFixed(1);
}

export function sortedMeasures(measures: MeasurementEntry[]): MeasurementEntry[] {
  return [...measures].sort((a, b) => a.ts - b.ts);
}

/** Chronological points for one body measure, skipping entries without it. */
export function measureSeries(measures: MeasurementEntry[], key: MeasureKey): { ts: number; inches: number }[] {
  return sortedMeasures(measures)
    .filter((m) => m.valuesIn[key] != null)
    .map((m) => ({ ts: m.ts, inches: m.valuesIn[key]! }));
}

/** The measurement closest to ts for one measure, within a window. */
export function nearestMeasureIn(measures: MeasurementEntry[], key: MeasureKey, ts: number, windowDays = 14): number | undefined {
  let best: { ts: number; inches: number } | undefined;
  for (const p of measureSeries(measures, key)) {
    if (Math.abs(p.ts - ts) > windowDays * 86_400_000) continue;
    if (!best || Math.abs(p.ts - ts) < Math.abs(best.ts - ts)) best = p;
  }
  return best?.inches;
}

/** Most recent recorded value for each measure — used to prefill the next check-in. */
export function latestValues(measures: MeasurementEntry[]): Partial<Record<MeasureKey, number>> {
  const latest: Partial<Record<MeasureKey, number>> = {};
  for (const m of sortedMeasures(measures)) {
    for (const { key } of MEASURES) {
      if (m.valuesIn[key] != null) latest[key] = m.valuesIn[key];
    }
  }
  return latest;
}
