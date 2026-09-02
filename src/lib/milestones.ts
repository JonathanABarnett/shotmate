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

const LBS_MARKS: [number, string][] = [
  [5, "✨"],
  [10, "⚖️"],
  [15, "🎈"],
  [20, "💪"],
  [25, "🎯"],
  [30, "🌟"],
  [35, "🚀"],
  [40, "🏔️"],
  [45, "🎖️"],
  [50, "🏆"],
  [60, "👑"],
  [75, "💎"],
  [100, "🦄"],
];

const PCT_MARKS: [number, string, string][] = [
  [5, "🌱", "The marker clinicians call clinically meaningful — your health is already responding."],
  [10, "🌿", "Double digits — this is where blood pressure, sleep, and joints really feel it."],
  [15, "🌳", "Rarefied air — you've built something lasting."],
  [20, "🏅", "Twenty percent — the territory clinical trials save for their biggest headlines."],
];

/** Celebration-owned achievement keys — the unlock-toast hook leaves these alone. */
export const MILESTONE_KEYS = new Set([
  ...LBS_MARKS.map(([lbs]) => `lbs-${lbs}`),
  ...PCT_MARKS.map(([pct]) => `pct-${pct}`),
  "goal-half",
  "goal-reached",
]);

const label = (lbs: number, unit: Unit) => `${Math.round(toDisplayWeight(lbs, unit))} ${unit}`;

type Stop = Milestone & { atLostLbs: number };

/** The next uncelebrated weight milestone the 7-day trend has crossed — smallest first, so parties arrive in order. */
export function crossedMilestone(data: AppData, now = Date.now()): Milestone | undefined {
  if (data.sample || !data.onboarded) return undefined;
  const start = startWeightLbs(data);
  const trend = trendWeightLbs(data, now);
  if (start == null || trend == null) return undefined;
  const lost = start - trend;
  const unit = data.settings.unit;
  const seen = new Set(data.seenAchievements);

  const stops: Stop[] = [
    ...LBS_MARKS.map(
      ([lbs, emoji]): Stop => ({
        key: `lbs-${lbs}`,
        emoji,
        atLostLbs: lbs,
        title: `${label(lbs, unit)} down!`,
        sub: "Your 7-day average just crossed it — that's real change, not a water blip. You did that.",
        winText: `${label(lbs, unit)} down (7-day average) 🎉`,
      })
    ),
    ...PCT_MARKS.map(
      ([mark, emoji, note]): Stop => ({
        key: `pct-${mark}`,
        emoji,
        atLostLbs: (start * mark) / 100,
        title: `${mark}% of your starting weight!`,
        sub: note,
        winText: `Lost ${mark}% of my starting weight ${emoji}`,
      })
    ),
  ];

  const goal = data.settings.goalLbs;
  if (goal != null && goal < start) {
    const totalLbs = start - goal;
    stops.push(
      {
        key: "goal-half",
        emoji: "🧗",
        atLostLbs: totalLbs / 2,
        title: "Halfway to your goal!",
        sub: `From ${label(start, unit)} toward ${label(goal, unit)} — the 7-day average says you're past the midpoint. The view's better from here.`,
        winText: "Halfway to my goal weight 🧗",
      },
      {
        key: "goal-reached",
        emoji: "🏁",
        atLostLbs: totalLbs,
        title: "You reached your goal!",
        sub: `The 7-day average is at ${label(goal, unit)} — the number you picked when this whole thing started. Extraordinary work.`,
        winText: `Reached my goal weight — ${label(goal, unit)} 🏁`,
      }
    );
  }

  return stops.sort((a, b) => a.atLostLbs - b.atLostLbs).find((s) => lost >= s.atLostLbs && !seen.has(s.key));
}
