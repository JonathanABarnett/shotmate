import type { EffectEntry, Severity } from "../types";

/** Exclusive "no symptoms" check-in — a good day on the record, never counted as a side effect. */
export const FEELING_FINE = "Feeling fine";
/** Appetite coming back — logged like a symptom; a useful signal around dose timing. */
export const STILL_HUNGRY = "Still hungry";

export const EFFECT_OPTIONS = [
  "Nausea",
  "Fatigue",
  "Constipation",
  "Diarrhea",
  "Headache",
  "Heartburn",
  "Low appetite",
  STILL_HUNGRY,
  "Dizziness",
  "Injection site redness",
  "Bloating",
  "Vomiting",
  "Sulfur burps",
];

export const isFeelingFine = (entry: Pick<EffectEntry, "effects">) => entry.effects.includes(FEELING_FINE);

/** Entries describing actual symptoms — drops "feeling fine" check-ins. */
export const symptomEntries = <T extends Pick<EffectEntry, "effects">>(entries: T[]): T[] =>
  entries.filter((e) => !isFeelingFine(e));

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
