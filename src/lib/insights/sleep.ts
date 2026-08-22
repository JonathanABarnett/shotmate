import type { AppData, CheckinEntry } from "../../types";
import { HOUR } from "../dates";
import { cycleOffsetDays, mean, round1 } from "./shared";

export interface SleepHunger {
  poorNights: number;
  goodNights: number;
  /** hunger vs. the usual for that cycle day, averaged over days after poor sleep */
  poorShift: number;
  /** same, after good sleep */
  goodShift: number;
  /** poorShift − goodShift: how much hungrier a rough night leaves you */
  delta: number;
  summary: string;
  energyNote?: string;
}

const MIN_PAIRS = 8;
const MIN_GROUP = 3;
const POOR_SLEEP = 2;
const GOOD_SLEEP = 4;
const NOTABLE = 0.5;
const NO_CYCLE = -1;

const hasSleepAndHunger = (c: CheckinEntry) => c.sleep != null && c.hunger != null;
const energies = (group: CheckinEntry[]) => group.flatMap((c) => (c.energy != null ? [c.energy] : []));

/** Each check-in's hunger relative to the usual for that day of the cycle — so late-cycle creep doesn't masquerade as a sleep effect. */
function hungerShifts(pairs: CheckinEntry[], data: AppData): Map<CheckinEntry, number> {
  const offsetOf = (c: CheckinEntry) => (data.shots.length ? (cycleOffsetDays(c.day + 12 * HOUR, data.shots) ?? NO_CYCLE) : NO_CYCLE);
  const byOffset = new Map<number, number[]>();
  for (const c of pairs) {
    const bucket = byOffset.get(offsetOf(c)) ?? [];
    bucket.push(c.hunger!);
    byOffset.set(offsetOf(c), bucket);
  }
  return new Map(pairs.map((c) => [c, c.hunger! - mean(byOffset.get(offsetOf(c))!)!]));
}

function energyNote(poor: CheckinEntry[], good: CheckinEntry[]): string | undefined {
  const afterPoor = mean(energies(poor));
  const afterGood = mean(energies(good));
  if (afterPoor == null || afterGood == null || afterGood - afterPoor < NOTABLE) return undefined;
  return `Energy follows too — about ${round1(afterGood)} after good sleep vs ${round1(afterPoor)} after rough nights.`;
}

/** Does a rough night show up as a hungrier day, once you account for where you are in your cycle? */
export function sleepVsHunger(data: AppData): SleepHunger | undefined {
  const pairs = data.checkins.filter(hasSleepAndHunger);
  if (pairs.length < MIN_PAIRS) return undefined;
  const poor = pairs.filter((c) => c.sleep! <= POOR_SLEEP);
  const good = pairs.filter((c) => c.sleep! >= GOOD_SLEEP);
  if (poor.length < MIN_GROUP || good.length < MIN_GROUP) return undefined;

  const shifts = hungerShifts(pairs, data);
  const poorShift = mean(poor.map((c) => shifts.get(c)!))!;
  const goodShift = mean(good.map((c) => shifts.get(c)!))!;
  const delta = poorShift - goodShift;
  const summary =
    delta >= NOTABLE
      ? `After a rough night your hunger runs about ${round1(delta)} higher than usual for that point in your cycle — protecting sleep is an appetite tool.`
      : "Sleep doesn't move your hunger much once you account for where you are in your cycle — nice and steady.";

  return { poorNights: poor.length, goodNights: good.length, poorShift, goodShift, delta, summary, energyNote: energyNote(poor, good) };
}
