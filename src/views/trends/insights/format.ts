import type { Unit } from "../../../types";
import { lengthUnit, toDisplayLength } from "../../../lib/measures";
import { toDisplayWeight } from "../../../lib/weight";

/** "−2.1 lbs" / "+0.4 kg" — signed, in the user's unit. */
export function signedWeight(lbs: number, unit: Unit, digits = 1): string {
  const v = toDisplayWeight(lbs, unit);
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(digits)} ${unit}`;
}

/** "−1.2 lbs/wk" */
export function weeklyRateText(lbsPerWeek: number, unit: Unit): string {
  return `${signedWeight(lbsPerWeek, unit)}/wk`;
}

/** "−0.8 in" / "+1.1 cm" */
export function signedLength(inches: number, unit: Unit): string {
  const v = toDisplayLength(inches, unit);
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)} ${lengthUnit(unit)}`;
}

/** Unsigned magnitude in the user's unit: "3.6 lbs" */
export function absWeight(lbs: number, unit: Unit, digits = 1): string {
  return `${Math.abs(toDisplayWeight(lbs, unit)).toFixed(digits)} ${unit}`;
}
