import type { AppData, MeasureKey } from "../types";
import { fmtLength, lengthUnit, nearestMeasureIn } from "./measures";
import { fmtWeight, nearestWeightLbs } from "./weight";

/** The numbers worth showing beside a progress photo — the compare view, the zoom, the share card, the reel. */

const DETAIL_TAPES: { key: MeasureKey; label: string }[] = [
  { key: "waist", label: "Waist" },
  { key: "stomach", label: "Stomach" },
  { key: "hips", label: "Hips" },
  { key: "chest", label: "Chest" },
];

export interface PhotoDetails {
  weight?: string;
  tapes: string[];
}

/** Weight plus every taped measure recorded near the photo's date. */
export function photoDetails(data: AppData, ts: number): PhotoDetails {
  const unit = data.settings.unit;
  const lbs = nearestWeightLbs(data.weights, ts);
  const mark = lengthUnit(unit) === "in" ? "″" : " cm";
  const tapes: string[] = [];
  for (const { key, label } of DETAIL_TAPES) {
    const inches = nearestMeasureIn(data.measures, key, ts);
    if (inches != null) tapes.push(`${label} ${fmtLength(inches, unit)}${mark}`);
  }
  return { weight: lbs != null ? fmtWeight(lbs, unit) : undefined, tapes };
}

export interface PhotoStats {
  stats: string[];
  lbs?: number;
  waistIn?: number;
}

/** Weight and waist nearest a photo's date, as short stat strings — the compact pair for cards and reels. */
export function photoStats(data: AppData, ts: number): PhotoStats {
  const unit = data.settings.unit;
  const lbs = nearestWeightLbs(data.weights, ts);
  const waistIn = nearestMeasureIn(data.measures, "waist", ts);
  const stats = [
    ...(lbs != null ? [fmtWeight(lbs, unit)] : []),
    ...(waistIn != null ? [`Waist ${fmtLength(waistIn, unit)} ${lengthUnit(unit)}`] : []),
  ];
  return { stats, lbs, waistIn };
}