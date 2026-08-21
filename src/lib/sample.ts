import type { AppData, DailyIntake, EffectEntry, MeasurementEntry, Settings, Shot, SiteId, WeightEntry, WinEntry } from "../types";
import { DAY, HOUR, startOfDay } from "./dates";
import { uid } from "./ids";

/** Deterministic pseudo-random so the demo always looks good. */
function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROTATION: SiteId[] = ["ab-l", "ab-r", "th-l", "th-r", "arm-l", "arm-r"];
const WEEKS = 12;

function sampleSettings(base: Settings, now: number): Settings {
  return {
    ...base,
    name: base.name || "Sam",
    medKey: "zepbound",
    scheduleDays: 7,
    plannedDoseMg: 7.5,
    unit: base.unit || "lbs",
    startLbs: 231.8,
    goalLbs: 185,
    heightIn: base.heightIn ?? 69,
    vialMgPerMl: 10,
    supplyMg: 40,
    supplySetTs: now - 3 * DAY,
  };
}

function sampleShots(firstShot: number, rnd: () => number): Shot[] {
  return Array.from({ length: WEEKS }, (_, w) => ({
    id: uid(),
    ts: firstShot + w * 7 * DAY + (rnd() - 0.5) * 6 * HOUR,
    doseMg: w < 4 ? 2.5 : w < 8 ? 5 : 7.5,
    site: ROTATION[w % ROTATION.length],
    note: w === 0 ? "First shot — a little nervous, went fine!" : undefined,
  }));
}

function sampleWeights(firstShot: number, startLbs: number, now: number, rnd: () => number): WeightEntry[] {
  const weights: WeightEntry[] = [];
  const start = firstShot - 2 * DAY;
  let lbs = startLbs;
  for (let d = 0; d <= (now - start) / DAY; d++) {
    const ts = start + d * DAY + 8 * HOUR + rnd() * 2 * HOUR;
    if (ts > now) break;
    // Slow start, then steady loss that gently eases; daily noise on top.
    const week = d / 7;
    const weeklyLoss = week < 1.5 ? 0.9 : week < 8 ? 2.3 : 1.7;
    lbs -= (weeklyLoss / 7) * (0.7 + rnd() * 0.6);
    if (rnd() < 0.55) {
      weights.push({ id: uid(), ts, lbs: Math.round((lbs + (rnd() - 0.5) * 1.6) * 10) / 10 });
    }
  }
  return weights;
}

function sampleEffects(firstShot: number): EffectEntry[] {
  const entry = (day: number, effects: string[], severity: 1 | 2 | 3, note?: string): EffectEntry => ({
    id: uid(),
    ts: firstShot + day * DAY,
    effects,
    severity,
    note,
  });
  return [
    entry(1.2, ["Nausea", "Fatigue"], 2, "Worst the day after the shot."),
    entry(8.4, ["Nausea"], 1),
    entry(22, ["Constipation"], 2, "More water + fiber helped."),
    entry(29.3, ["Nausea", "Sulfur burps"], 2, "Started 5 mg this week."),
    entry(36, ["Fatigue"], 1),
    entry(57.5, ["Nausea"], 1, "Mild, passed by evening."),
    entry(64.2, ["Low appetite"], 1),
  ];
}

function sampleMeasures(firstShot: number): MeasurementEntry[] {
  // Fortnightly tape check-ins, easing down alongside the weight trend.
  const chest = [46.0, 45.4, 44.9, 44.5, 44.1, 43.8];
  const waist = [44.0, 43.2, 42.4, 41.8, 41.2, 40.6];
  const hips = [47.0, 46.5, 46.1, 45.8, 45.5, 45.2];
  return chest.map((c, i) => ({
    id: uid(),
    ts: firstShot + i * 14 * DAY + 9 * HOUR,
    valuesIn: { chest: c, waist: waist[i], hips: hips[i] },
    note: i === 0 ? "Starting numbers — deep breath!" : undefined,
  }));
}

function sampleWins(firstShot: number): WinEntry[] {
  return [
    { id: uid(), ts: firstShot + 26 * DAY, text: "Belt moved in a notch!" },
    { id: uid(), ts: firstShot + 52 * DAY, text: "Hiked the long loop without stopping — first time in years." },
    { id: uid(), ts: firstShot + 74 * DAY, text: "Wore the shirt from the back of the closet 🎉" },
  ];
}

function sampleActivities(firstShot: number): AppData["activities"] {
  const walk = (day: number, minutes: number, mi: number) => ({
    id: uid(),
    ts: firstShot + day * DAY + 17 * HOUR,
    type: "walk" as const,
    minutes,
    distanceMi: mi,
  });
  const run = (day: number, minutes: number, mi: number) => ({
    id: uid(),
    ts: firstShot + day * DAY + 7 * HOUR,
    type: "run" as const,
    minutes,
    distanceMi: mi,
    imported: true,
  });
  return [
    walk(35, 25, 1.1),
    walk(42, 30, 1.4),
    walk(46, 35, 1.6),
    run(52, 22, 1.8),
    walk(56, 40, 2.0),
    run(60, 25, 2.1),
    walk(63, 45, 2.2),
    run(67, 28, 2.4),
    walk(70, 40, 2.1),
    run(74, 30, 2.7),
  ];
}

function sampleIntake(now: number): DailyIntake[] {
  const today = startOfDay(now);
  return [
    { id: uid(), day: today - DAY, proteinG: 105, waterFlOz: 64 },
    { id: uid(), day: today, proteinG: 45, waterFlOz: 24 },
  ];
}

export function sampleData(base: Settings): AppData {
  const rnd = mulberry(20260821);
  const now = Date.now();
  const firstShot = now - (WEEKS - 1) * 7 * DAY - 2 * DAY;
  const settings = sampleSettings(base, now);
  return {
    v: 1,
    onboarded: true,
    sample: true,
    settings,
    shots: sampleShots(firstShot, rnd),
    weights: sampleWeights(firstShot, settings.startLbs!, now, rnd),
    effects: sampleEffects(firstShot),
    measures: sampleMeasures(firstShot),
    photos: [],
    wins: sampleWins(firstShot),
    intake: sampleIntake(now),
    activities: sampleActivities(firstShot),
  };
}
