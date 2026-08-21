import type { Severity } from "../types";

export const EFFECT_OPTIONS = [
  "Nausea",
  "Fatigue",
  "Constipation",
  "Diarrhea",
  "Headache",
  "Heartburn",
  "Low appetite",
  "Dizziness",
  "Injection site redness",
  "Bloating",
  "Vomiting",
  "Sulfur burps",
];

export interface SeverityMeta {
  value: Severity;
  label: string;
  emoji: string;
}

export const SEVERITIES: SeverityMeta[] = [
  { value: 1, label: "Mild", emoji: "🙂" },
  { value: 2, label: "Moderate", emoji: "😕" },
  { value: 3, label: "Rough", emoji: "🥴" },
];

export function severityMeta(value: Severity): SeverityMeta {
  return SEVERITIES.find((s) => s.value === value) ?? SEVERITIES[0];
}
