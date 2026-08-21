import type { Settings } from "../types";

export interface MedInfo {
  key: string;
  brand: string;
  generic: string;
  halfLifeH: number;
  /** usual titration ladder, mg */
  doses: number[];
  emoji: string;
}

export const MEDS: MedInfo[] = [
  { key: "wegovy", brand: "Wegovy", generic: "semaglutide", halfLifeH: 168, doses: [0.25, 0.5, 1, 1.7, 2.4], emoji: "🩵" },
  { key: "ozempic", brand: "Ozempic", generic: "semaglutide", halfLifeH: 168, doses: [0.25, 0.5, 1, 2], emoji: "💙" },
  { key: "zepbound", brand: "Zepbound", generic: "tirzepatide", halfLifeH: 120, doses: [2.5, 5, 7.5, 10, 12.5, 15], emoji: "💜" },
  { key: "mounjaro", brand: "Mounjaro", generic: "tirzepatide", halfLifeH: 120, doses: [2.5, 5, 7.5, 10, 12.5, 15], emoji: "🩶" },
  { key: "saxenda", brand: "Saxenda", generic: "liraglutide", halfLifeH: 13, doses: [0.6, 1.2, 1.8, 2.4, 3], emoji: "🤍" },
  { key: "trulicity", brand: "Trulicity", generic: "dulaglutide", halfLifeH: 112, doses: [0.75, 1.5, 3, 4.5], emoji: "💚" },
  { key: "tirz-compound", brand: "Compounded tirzepatide", generic: "tirzepatide · vials", halfLifeH: 120, doses: [2, 2.5, 5, 7.5, 10, 12.5, 15], emoji: "🧪" },
  { key: "sema-compound", brand: "Compounded semaglutide", generic: "semaglutide · vials", halfLifeH: 168, doses: [0.25, 0.5, 1, 1.7, 2.4], emoji: "⚗️" },
  { key: "custom", brand: "Something else", generic: "custom medication", halfLifeH: 120, doses: [1, 2.5, 5, 10], emoji: "✨" },
];

/** The slice of settings that identifies a medication. */
export type MedSelection = Pick<Settings, "medKey" | "customMedName" | "customHalfLifeH">;

/** The user's medication, with custom name/half-life applied when relevant. */
export function medFor(settings: MedSelection): MedInfo {
  const med = MEDS.find((m) => m.key === settings.medKey) ?? MEDS[0];
  if (med.key !== "custom") return med;
  return {
    ...med,
    brand: settings.customMedName?.trim() || "My medication",
    halfLifeH: settings.customHalfLifeH || med.halfLifeH,
  };
}
