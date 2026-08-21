import type { VitalKey, VitalsEntry } from "../types";

export interface VitalInfo {
  key: VitalKey;
  label: string;
  short: string;
  unit: string;
  decimals: number;
  group: "vitals" | "labs";
  max: number;
  /** most vitals improve going down; HDL is the exception */
  higherIsBetter?: boolean;
}

export const VITALS: VitalInfo[] = [
  { key: "systolic", label: "Systolic BP", short: "BP sys", unit: "mmHg", decimals: 0, group: "vitals", max: 300 },
  { key: "diastolic", label: "Diastolic BP", short: "BP dia", unit: "mmHg", decimals: 0, group: "vitals", max: 200 },
  { key: "restingHr", label: "Resting heart rate", short: "HR", unit: "bpm", decimals: 0, group: "vitals", max: 250 },
  { key: "a1c", label: "A1c", short: "A1c", unit: "%", decimals: 1, group: "labs", max: 20 },
  { key: "fastingGlucose", label: "Fasting glucose", short: "Glucose", unit: "mg/dL", decimals: 0, group: "labs", max: 600 },
  { key: "ldl", label: "LDL cholesterol", short: "LDL", unit: "mg/dL", decimals: 0, group: "labs", max: 500 },
  { key: "hdl", label: "HDL cholesterol", short: "HDL", unit: "mg/dL", decimals: 0, group: "labs", max: 200, higherIsBetter: true },
  { key: "triglycerides", label: "Triglycerides", short: "Trig", unit: "mg/dL", decimals: 0, group: "labs", max: 2000 },
];

export function vitalInfo(key: VitalKey): VitalInfo {
  return VITALS.find((v) => v.key === key)!;
}

export function fmtVital(key: VitalKey, value: number): string {
  const info = vitalInfo(key);
  const num = value.toFixed(info.decimals);
  return info.unit === "%" ? `${num}%` : `${num} ${info.unit}`;
}

export function sortedVitals(entries: VitalsEntry[]): VitalsEntry[] {
  return [...entries].sort((a, b) => a.ts - b.ts);
}

export function vitalSeries(entries: VitalsEntry[], key: VitalKey): { ts: number; value: number }[] {
  return sortedVitals(entries)
    .filter((e) => e.values[key] != null)
    .map((e) => ({ ts: e.ts, value: e.values[key]! }));
}

/** Most recent value of each vital — prefills the next check-in. */
export function latestVitalValues(entries: VitalsEntry[]): Partial<Record<VitalKey, number>> {
  const latest: Partial<Record<VitalKey, number>> = {};
  for (const e of sortedVitals(entries)) {
    for (const { key } of VITALS) if (e.values[key] != null) latest[key] = e.values[key];
  }
  return latest;
}

/** Compact summary pieces: "BP 128/82", "HR 64", "A1c 5.7%", … */
export function vitalsSummaryParts(values: VitalsEntry["values"]): string[] {
  const parts: string[] = [];
  if (values.systolic != null && values.diastolic != null) parts.push(`BP ${Math.round(values.systolic)}/${Math.round(values.diastolic)}`);
  else if (values.systolic != null) parts.push(`BP sys ${Math.round(values.systolic)}`);
  else if (values.diastolic != null) parts.push(`BP dia ${Math.round(values.diastolic)}`);
  for (const v of VITALS) {
    if (v.key === "systolic" || v.key === "diastolic") continue;
    const value = values[v.key];
    if (value == null) continue;
    parts.push(`${v.short} ${v.unit === "%" ? `${value.toFixed(1)}%` : Math.round(value)}`);
  }
  return parts;
}

export function isImprovement(key: VitalKey, delta: number): boolean {
  return vitalInfo(key).higherIsBetter ? delta > 0 : delta < 0;
}
