import type { AppData, MeasureKey, Unit } from "../types";
import { CM_PER_IN, lengthUnit, MEASURES, measureSeries, toDisplayLength } from "./measures";
import type { Milestone } from "./milestones";

export type TapeStop = Milestone & { measure: MeasureKey; lostIn: number };

/** Inches off a measure worth a party — cm users get round metric marks instead. */
const MARKS_IN = [1, 2, 3, 4, 5, 6, 8, 10, 12];
const MARKS_CM = [2, 5, 8, 10, 15, 20, 25, 30];

const EMOJI: Record<MeasureKey, string> = { chest: "👕", waist: "👖", stomach: "🎽", hips: "🧵", arm: "💪", thigh: "🦵" };

function note(key: MeasureKey, unit: Unit): string {
  const step = unit === "lbs" ? "two inches" : "five centimetres";
  switch (key) {
    case "chest":
      return `Shirts are cut to this number — sizes step about ${step} apart.`;
    case "waist":
      return `Pant sizes step about ${step} apart, belt notches half that.`;
    case "stomach":
      return "The stomach tape moves before the mirror does — this is the mirror's cue.";
    case "hips":
      return `Sizes step about ${step} apart here too.`;
    default:
      return "The tape is the honest one — it can't hold water.";
  }
}

const marks = (unit: Unit) => (unit === "lbs" ? MARKS_IN : MARKS_CM.map((cm) => cm / CM_PER_IN));

/** Every tape milestone for the measures on record, smallest first per measure. */
export function tapeStops(data: AppData): TapeStop[] {
  const unit = data.settings.unit;
  const mark = lengthUnit(unit) === "in" ? "″" : " cm";
  const stops: TapeStop[] = [];
  for (const { key, label } of MEASURES) {
    if (measureSeries(data.measures, key).length === 0) continue;
    for (const lostIn of marks(unit)) {
      const shown = Math.round(toDisplayLength(lostIn, unit) * 10) / 10;
      stops.push({
        key: `tape-${key}-${shown}${lengthUnit(unit)}`,
        measure: key,
        lostIn,
        emoji: EMOJI[key],
        title: `${label} down ${shown}${mark}!`,
        sub: `${shown}${mark} off your ${label.toLowerCase()} since your first tape check-in, held across two readings — real, not the tape's mood. ${note(key, unit)}`,
        winText: `${label} down ${shown}${mark} since my first tape ${EMOJI[key]}`,
      });
    }
  }
  return stops;
}

/** Loss a measure has held: the first reading minus the larger of the last two, so one lucky tape can't award it. */
function heldLossIn(data: AppData, key: MeasureKey): number | undefined {
  const series = measureSeries(data.measures, key);
  if (series.length < 2) return undefined;
  const held = Math.max(series[series.length - 1].inches, series[series.length - 2].inches);
  return series[0].inches - held;
}

/** Tape milestones the data has reached and held. */
export function reachedTapeStops(data: AppData): TapeStop[] {
  const held = new Map<MeasureKey, number | undefined>();
  return tapeStops(data).filter((s) => {
    if (!held.has(s.measure)) held.set(s.measure, heldLossIn(data, s.measure));
    const loss = held.get(s.measure);
    return loss != null && loss >= s.lostIn - 1e-9;
  });
}

/** The next uncelebrated tape milestone — smallest first, so parties arrive in order. */
export function crossedTapeMilestone(data: AppData): TapeStop | undefined {
  if (data.sample || !data.onboarded) return undefined;
  const seen = new Set(data.seenAchievements);
  return reachedTapeStops(data)
    .sort((a, b) => a.lostIn - b.lostIn)
    .find((s) => !seen.has(s.key));
}