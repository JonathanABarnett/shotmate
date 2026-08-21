import type { AppData, Unit } from "../types";
import { DAY, startOfDay } from "./dates";
import { proteinGoal } from "./intake";
import { sortedShots, streak } from "./shots";
import { latestWeight, startWeightLbs, toDisplayWeight } from "./weight";

export interface Achievement {
  key: string;
  emoji: string;
  title: string;
  desc: string;
  earned: boolean;
  /** 0..1 toward earning it */
  progress: number;
}

const ROTATION_WINDOW = 6;

function make(key: string, emoji: string, title: string, desc: string, value: number, target: number): Achievement {
  return { key, emoji, title, desc, earned: value >= target, progress: Math.max(0, Math.min(1, value / target)) };
}

function lostLbs(data: AppData): number {
  const start = startWeightLbs(data);
  const current = latestWeight(data.weights)?.lbs;
  return start != null && current != null ? Math.max(0, start - current) : 0;
}

function pctLost(data: AppData): number {
  const start = startWeightLbs(data);
  return start ? (lostLbs(data) / start) * 100 : 0;
}

/** Consecutive days with a weigh-in, ending today or yesterday. */
function weighInDayStreak(data: AppData, now = Date.now()): number {
  const days = new Set(data.weights.map((w) => startOfDay(w.ts)));
  let day = startOfDay(now);
  if (!days.has(day)) day -= DAY;
  let count = 0;
  while (days.has(day)) {
    count++;
    day -= DAY;
  }
  return count;
}

function distinctRecentSites(data: AppData): number {
  const recent = sortedShots(data.shots).slice(-ROTATION_WINDOW);
  return recent.length === ROTATION_WINDOW ? new Set(recent.map((s) => s.site)).size : 0;
}

function proteinDaysHit(data: AppData): number {
  const goal = proteinGoal(data);
  return data.intake.filter((i) => i.proteinG >= goal).length;
}

const lbsLabel = (lbs: number, unit: Unit) => `${Math.round(toDisplayWeight(lbs, unit))} ${unit}`;

/** Every badge with its current progress — derived, never stored. */
export function achievements(data: AppData): Achievement[] {
  const unit = data.settings.unit;
  const shots = data.shots.length;
  const onTime = streak(data.shots, data.settings.scheduleDays);
  const lost = lostLbs(data);
  const pct = pctLost(data);
  const activeMinutes = data.activities.reduce((s, a) => s + a.minutes, 0);

  return [
    make("first-shot", "💉", "First shot", "Logged your very first injection", shots, 1),
    make("shots-10", "🔟", "Ten in", "Ten shots logged", shots, 10),
    make("shots-25", "🗓️", "Quarter year", "25 shots logged", shots, 25),
    make("streak-4", "🔥", "On a roll", "4 on-time shots in a row", onTime, 4),
    make("streak-12", "🏅", "Clockwork", "12 on-time shots in a row", onTime, 12),
    make("rotation-6", "🔄", "Perfect rotation", "Six different sites in six shots", distinctRecentSites(data), ROTATION_WINDOW),
    make("pct-5", "🌱", "Five percent", "5% of your starting weight", pct, 5),
    make("pct-10", "🌿", "Ten percent", "10% of your starting weight — a clinical milestone", pct, 10),
    make("pct-15", "🌳", "Fifteen percent", "15% of your starting weight", pct, 15),
    make("lbs-10", "⚖️", `${lbsLabel(10, unit)} lighter`, `${lbsLabel(10, unit)} down from the start`, lost, 10),
    make("lbs-25", "🎯", `${lbsLabel(25, unit)} lighter`, `${lbsLabel(25, unit)} down from the start`, lost, 25),
    make("lbs-50", "🏆", `${lbsLabel(50, unit)} lighter`, `${lbsLabel(50, unit)} down from the start`, lost, 50),
    make("weigh-7", "📅", "Scale regular", "Weighed in 7 days straight", weighInDayStreak(data), 7),
    make("tape-1", "📏", "Tape's out", "First body measurements logged", data.measures.length, 1),
    make("tape-6", "🧵", "Measured up", "Six tape check-ins", data.measures.length, 6),
    make("checkin-7", "🍽️", "Week of check-ins", "7 daily hunger & energy check-ins", data.checkins.length, 7),
    make("checkin-30", "🧭", "Pattern spotter", "30 daily check-ins", data.checkins.length, 30),
    make("move-1", "👟", "Moving", "First activity logged", data.activities.length, 1),
    make("move-500", "🏃", "500 active minutes", "500 minutes of movement logged", activeMinutes, 500),
    make("protein-7", "🥩", "Protein week", "Hit your protein goal 7 days", proteinDaysHit(data), 7),
    make("win-1", "🎉", "First win", "Logged a non-scale victory", data.wins.length, 1),
    make("win-10", "🌟", "Winning streak", "Ten non-scale victories", data.wins.length, 10),
    make("photo-1", "📸", "Snapshot", "First progress photo", data.photos.length, 1),
    make("photo-5", "🎞️", "Time-lapse", "Five progress photos", data.photos.length, 5),
  ];
}

export function newlyEarned(all: Achievement[], seen: string[]): Achievement[] {
  const seenSet = new Set(seen);
  return all.filter((a) => a.earned && !seenSet.has(a.key));
}
