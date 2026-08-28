import type { AppData, CheckinEntry } from "../../types";
import { HOUR } from "../dates";
import { dayEnergy, dayHunger } from "../checkin";
import { cycleOffsetDays, mean, round1 } from "./shared";

export interface SleepPattern {
  poorNights: number;
  goodNights: number;
  /** how the comparison group reads — "good (4–5) nights", or "steadier (3) nights" for rough sleepers */
  goodLabel: string;
  /** hunger vs. the usual for that cycle day, averaged over days after poor sleep */
  poorShift: number;
  goodShift: number;
  /** poorShift − goodShift: how much hungrier a rough night leaves you */
  delta: number;
  summary: string;
  energyNote?: string;
}

/** The hunger correlation once there's contrast to compute it from; a plain read on rough averages until then. */
export type SleepInsight =
  | ({ kind: "pattern" } & SleepPattern)
  | { kind: "quality"; avg: number; nights: number; roughShare: number; summary: string };

const MIN_PAIRS = 8;
const MIN_GROUP = 3;
const MIN_NIGHTS = 5;
const POOR_SLEEP = 2;
const GOOD_SLEEP = 4;
const NOTABLE = 0.5;
const NO_CYCLE = -1;

const hasSleepAndHunger = (c: CheckinEntry) => c.sleep != null && dayHunger(c) != null;
const energies = (group: CheckinEntry[]) =>
  group.flatMap((c) => {
    const e = dayEnergy(c);
    return e != null ? [e] : [];
  });

/** Each check-in's hunger relative to the usual for that day of the cycle — so late-cycle creep doesn't masquerade as a sleep effect. */
function hungerShifts(pairs: CheckinEntry[], data: AppData): Map<CheckinEntry, number> {
  const offsetOf = (c: CheckinEntry) => (data.shots.length ? (cycleOffsetDays(c.day + 12 * HOUR, data.shots) ?? NO_CYCLE) : NO_CYCLE);
  const byOffset = new Map<number, number[]>();
  for (const c of pairs) {
    const bucket = byOffset.get(offsetOf(c)) ?? [];
    bucket.push(dayHunger(c)!);
    byOffset.set(offsetOf(c), bucket);
  }
  return new Map(pairs.map((c) => [c, dayHunger(c)! - mean(byOffset.get(offsetOf(c))!)!]));
}

function energyNote(poor: CheckinEntry[], good: CheckinEntry[]): string | undefined {
  const afterPoor = mean(energies(poor));
  const afterGood = mean(energies(good));
  if (afterPoor == null || afterGood == null || afterGood - afterPoor < NOTABLE) return undefined;
  return `Energy follows too — about ${round1(afterGood)} after better sleep vs ${round1(afterPoor)} after rough nights.`;
}

function sleepPattern(data: AppData): SleepPattern | undefined {
  const pairs = data.checkins.filter(hasSleepAndHunger);
  if (pairs.length < MIN_PAIRS) return undefined;
  const poor = pairs.filter((c) => c.sleep! <= POOR_SLEEP);
  let good = pairs.filter((c) => c.sleep! >= GOOD_SLEEP);
  let goodLabel = "good (4–5) nights";
  if (good.length < MIN_GROUP) {
    good = pairs.filter((c) => c.sleep! === 3);
    goodLabel = "steadier (3) nights";
  }
  if (poor.length < MIN_GROUP || good.length < MIN_GROUP) return undefined;

  const shifts = hungerShifts(pairs, data);
  const poorShift = mean(poor.map((c) => shifts.get(c)!))!;
  const goodShift = mean(good.map((c) => shifts.get(c)!))!;
  const delta = poorShift - goodShift;
  const summary =
    delta >= NOTABLE
      ? `After a rough night your hunger runs about ${round1(delta)} higher than usual for that point in your cycle — protecting sleep is an appetite tool.`
      : "Sleep doesn't move your hunger much once you account for where you are in your cycle — nice and steady.";

  return { poorNights: poor.length, goodNights: good.length, goodLabel, poorShift, goodShift, delta, summary, energyNote: energyNote(poor, good) };
}

/** Does a rough night show up as a hungrier day — or, before that's computable, how rough are the nights? */
export function sleepInsight(data: AppData): SleepInsight | undefined {
  const pattern = sleepPattern(data);
  if (pattern) return { kind: "pattern", ...pattern };
  const rated = data.checkins.flatMap((c) => (c.sleep != null ? [c.sleep] : []));
  if (rated.length < MIN_NIGHTS) return undefined;
  const avg = mean(rated)!;
  if (avg >= 3) return undefined;
  const roughShare = rated.filter((s) => s <= POOR_SLEEP).length / rated.length;
  return {
    kind: "quality",
    avg,
    nights: rated.length,
    roughShare,
    summary: `Sleep is averaging ${round1(avg)} of 5 — ${Math.round(roughShare * 100)}% of nights rough or broken. That matters double on GLP-1: short nights push hunger hormones the wrong way. A consistent wind-down is the cheapest appetite tool you have.`,
  };
}
