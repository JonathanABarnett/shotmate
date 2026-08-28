import type { AppData, Unit } from "../types";
import { trendWeightLbs } from "./insights/noiseTrend";
import { startWeightLbs, toDisplayWeight } from "./weight";

export interface Milestone {
  key: string;
  emoji: string;
  title: string;
  sub: string;
  winText: string;
}

/** Celebration-owned achievement keys — the unlock-toast hook leaves these alone. */
export const MILESTONE_KEYS = new Set(["lbs-5", "lbs-10", "lbs-25", "lbs-50", "pct-5", "pct-10", "pct-15"]);

const label = (lbs: number, unit: Unit) => `${Math.round(toDisplayWeight(lbs, unit))} ${unit}`;

type Stop = Milestone & { reached: boolean };

/** The next uncelebrated weight milestone the 7-day trend has crossed — smallest first, so parties arrive in order. */
export function crossedMilestone(data: AppData, now = Date.now()): Milestone | undefined {
  if (data.sample || !data.onboarded) return undefined;
  const start = startWeightLbs(data);
  const trend = trendWeightLbs(data, now);
  if (start == null || trend == null) return undefined;
  const lost = start - trend;
  const pct = (lost / start) * 100;
  const unit = data.settings.unit;
  const seen = new Set(data.seenAchievements);

  const lbsStop = (lbs: number, key: string, emoji: string): Stop => ({
    key,
    emoji,
    reached: lost >= lbs,
    title: `${label(lbs, unit)} down!`,
    sub: "Your 7-day average just crossed it — that's real change, not a water blip. You did that.",
    winText: `${label(lbs, unit)} down (7-day average) 🎉`,
  });
  const pctStop = (mark: number, key: string, emoji: string, note: string): Stop => ({
    key,
    emoji,
    reached: pct >= mark,
    title: `${mark}% of your starting weight!`,
    sub: note,
    winText: `Lost ${mark}% of my starting weight ${emoji}`,
  });

  const stops: Stop[] = [
    lbsStop(5, "lbs-5", "✨"),
    pctStop(5, "pct-5", "🌱", "The marker clinicians call clinically meaningful — your health is already responding."),
    lbsStop(10, "lbs-10", "⚖️"),
    pctStop(10, "pct-10", "🌿", "Double digits — this is where blood pressure, sleep, and joints really feel it."),
    lbsStop(25, "lbs-25", "🎯"),
    pctStop(15, "pct-15", "🌳", "Rarefied air — you've built something lasting."),
    lbsStop(50, "lbs-50", "🏆"),
  ];
  return stops.find((s) => s.reached && !seen.has(s.key));
}
