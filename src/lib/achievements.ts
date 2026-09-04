import type { AppData, Unit } from "../types";
import { fmtDistance, weekStart } from "./activity";
import { bestDayRun, DAY, dayStreak, HOUR, startOfDay } from "./dates";
import { isFeelingFine } from "./effects";
import { proteinGoal, waterGoalFlOz } from "./intake";
import { sortedShots, streak } from "./shots";
import { trendWeightLbs } from "./insights/noiseTrend";
import { startWeightLbs, toDisplayWeight } from "./weight";

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

/** Loss measured on the 7-day trend, so a single light morning can't award a badge. */
function lostLbs(data: AppData): number {
  const start = startWeightLbs(data);
  const current = trendWeightLbs(data);
  return start != null && current != null ? Math.max(0, start - current) : 0;
}

function pctLost(data: AppData): number {
  const start = startWeightLbs(data);
  return start ? (lostLbs(data) / start) * 100 : 0;
}

/** Consecutive days with a weigh-in, ending today or yesterday. */
export function weighInDayStreak(data: AppData, now = Date.now()): number {
  return dayStreak(new Set(data.weights.map((w) => startOfDay(w.ts))), now);
}

function distinctRecentSites(data: AppData): number {
  const recent = sortedShots(data.shots).slice(-ROTATION_WINDOW);
  return recent.length === ROTATION_WINDOW ? new Set(recent.map((s) => s.site)).size : 0;
}

function proteinDaysHit(data: AppData): number {
  const goal = proteinGoal(data);
  return data.intake.filter((i) => i.proteinG >= goal).length;
}

function waterDaysHit(data: AppData): number {
  const goal = waterGoalFlOz(data);
  return data.intake.filter((i) => i.waterFlOz >= goal).length;
}

function fineDays(data: AppData): number {
  return new Set(data.effects.filter(isFeelingFine).map((e) => startOfDay(e.ts))).size;
}

/** Days where all three check-in slots got a reading. */
function fullSlotDays(data: AppData): number {
  const logged = ({ hunger, energy }: { hunger?: number; energy?: number } = {}) => hunger != null || energy != null;
  return data.checkins.filter((c) => logged(c.slots?.morning) && logged(c.slots?.afternoon) && logged(c.slots?.evening)).length;
}

/** Weeks where everything happened: shot, daily weigh-ins and check-ins, 3+ moves, tape, and a photo. */
function completeWeeks(data: AppData): number {
  interface WeekTally {
    weigh: Set<number>;
    check: Set<number>;
    moves: number;
    shot: boolean;
    tape: boolean;
    photo: boolean;
  }
  const byWeek = new Map<number, WeekTally>();
  const bucket = (ts: number): WeekTally => {
    const w = weekStart(ts);
    let tally = byWeek.get(w);
    if (!tally) {
      tally = { weigh: new Set(), check: new Set(), moves: 0, shot: false, tape: false, photo: false };
      byWeek.set(w, tally);
    }
    return tally;
  };
  for (const w of data.weights) bucket(w.ts).weigh.add(startOfDay(w.ts));
  for (const c of data.checkins) bucket(c.day).check.add(c.day);
  for (const a of data.activities) bucket(a.ts).moves++;
  for (const s of data.shots) bucket(s.ts).shot = true;
  for (const m of data.measures) bucket(m.ts).tape = true;
  for (const p of data.photos) bucket(p.ts).photo = true;
  return [...byWeek.values()].filter((t) => t.weigh.size >= 7 && t.check.size >= 7 && t.moves >= 3 && t.shot && t.tape && t.photo).length;
}

/** Longest weigh-in run that began right after a 3+ day break — coming back is the skill worth rewarding. */
function comebackRun(data: AppData): number {
  const days = [...new Set(data.weights.map((w) => startOfDay(w.ts)))].sort((a, b) => a - b);
  let run = 0;
  let afterBreak = false;
  let best = 0;
  for (let i = 0; i < days.length; i++) {
    const gap = i === 0 ? 0 : days[i] - days[i - 1];
    if (i > 0 && gap <= 30 * HOUR) run++;
    else {
      afterBreak = i > 0 && gap >= 84 * HOUR;
      run = 1;
    }
    if (afterBreak) best = Math.max(best, run);
  }
  return best;
}

/** Days with a weigh-in, tape measurements, and a progress photo all together. */
function ritualDays(data: AppData): number {
  const days = (tss: number[]) => new Set(tss.map(startOfDay));
  const weighed = days(data.weights.map((w) => w.ts));
  const taped = days(data.measures.map((m) => m.ts));
  return [...days(data.photos.map((p) => p.ts))].filter((d) => weighed.has(d) && taped.has(d)).length;
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
  const totalMiles = data.activities.reduce((s, a) => s + (a.distanceMi ?? 0), 0);
  const weighRun = bestDayRun(new Set(data.weights.map((w) => startOfDay(w.ts))));
  const moveRun = bestDayRun(new Set(data.activities.map((a) => startOfDay(a.ts))));
  const kcalDays = data.intake.filter((i) => (i.kcal ?? 0) > 0).length;
  const runs = data.activities.filter((a) => a.type === "run");
  const longestRunMin = Math.max(0, ...runs.map((r) => r.minutes));
  const longestRunMi = Math.max(0, ...runs.map((r) => r.distanceMi ?? 0));
  const typesUsed = new Set(data.activities.map((a) => a.type)).size;
  const dayMinutes = new Map<number, number>();
  for (const a of data.activities) {
    const day = startOfDay(a.ts);
    dayMinutes.set(day, (dayMinutes.get(day) ?? 0) + a.minutes);
  }
  const bestDayMinutes = Math.max(0, ...dayMinutes.values());
  const fine = fineDays(data);
  const rituals = ritualDays(data);
  const firstTs = Math.min(...data.shots.map((s) => s.ts), ...data.weights.map((w) => w.ts));
  const tenureDays = Number.isFinite(firstTs) ? Math.max(0, (Date.now() - firstTs) / DAY) : 0;
  const kindsLogged = [
    shots,
    data.weights.length,
    data.measures.length,
    data.photos.length,
    data.checkins.length,
    data.effects.length,
    data.activities.length,
    data.wins.length,
    kcalDays,
    data.vitals.length,
  ].filter((n) => n > 0).length;

  return [
    make("first-shot", "💉", "First shot", "Logged your very first injection", shots, 1),
    make("shots-10", "🔟", "Ten in", "Ten shots logged", shots, 10),
    make("shots-25", "🗓️", "Quarter year", "25 shots logged", shots, 25),
    make("shots-52", "📆", "Year of shots", "52 shots logged — a full year of showing up", shots, 52),
    make("shots-100", "🛡️", "Centurion", "100 shots logged", shots, 100),
    make("days-90", "📖", "Three months in", "90 days since your first log", tenureDays, 90),
    make("days-365", "🎂", "Year one", "A full year since your first log", tenureDays, 365),
    make("streak-4", "🔥", "On a roll", "4 on-time shots in a row", onTime, 4),
    make("streak-12", "🏅", "Clockwork", "12 on-time shots in a row", onTime, 12),
    make("streak-26", "🎖️", "Half-year of on-time", "26 on-time shots in a row", onTime, 26),
    make("rotation-6", "🔄", "Perfect rotation", "Six different sites in six shots", distinctRecentSites(data), ROTATION_WINDOW),
    make("pct-5", "🌱", "Five percent", "5% of your starting weight", pct, 5),
    make("pct-10", "🌿", "Ten percent", "10% of your starting weight — a clinical milestone", pct, 10),
    make("pct-15", "🌳", "Fifteen percent", "15% of your starting weight", pct, 15),
    make("lbs-10", "⚖️", `${lbsLabel(10, unit)} lighter`, `${lbsLabel(10, unit)} down from the start`, lost, 10),
    make("lbs-25", "🎯", `${lbsLabel(25, unit)} lighter`, `${lbsLabel(25, unit)} down from the start`, lost, 25),
    make("lbs-50", "🏆", `${lbsLabel(50, unit)} lighter`, `${lbsLabel(50, unit)} down from the start`, lost, 50),
    make("weigh-7", "📅", "Scale regular", "Weighed in 7 days straight", weighRun, 7),
    make("weigh-30", "🌅", "Thirty mornings", "Weighed in 30 days straight", weighRun, 30),
    make("weigh-100", "☀️", "A hundred mornings", "100 weigh-ins logged", data.weights.length, 100),
    make("comeback-7", "🪃", "Right back at it", "A 3-day break, then 7 straight weigh-ins — coming back is the real skill", comebackRun(data), 7),
    make("tape-1", "📏", "Tape's out", "First body measurements logged", data.measures.length, 1),
    make("tape-6", "🧵", "Measured up", "Six tape check-ins", data.measures.length, 6),
    make("ritual-4", "🎨", "The full portrait", "Weigh-in, tape, and photo all on the same day — 4 times", rituals, 4),
    make("ritual-12", "🖼️", "Twelve portraits", "Weigh-in, tape, and photo together — 12 times", rituals, 12),
    make("vitals-1", "🩺", "Under the hood", "First labs & vitals entry — numbers your doctor will love", data.vitals.length, 1),
    make("checkin-7", "🍽️", "Week of check-ins", "7 daily hunger, energy & sleep check-ins", data.checkins.length, 7),
    make("checkin-30", "🧭", "Pattern spotter", "30 daily check-ins", data.checkins.length, 30),
    make("slots-3", "🕰️", "Round the clock", "Morning, afternoon, and evening check-ins in one day — 3 times", fullSlotDays(data), 3),
    make("fine-7", "😎", "Seven fine days", "Logged “Feeling fine” on 7 different days", fine, 7),
    make("fine-30", "🌞", "Thirty fine days", "Logged “Feeling fine” on 30 different days", fine, 30),
    make("move-1", "👟", "Moving", "First activity logged", data.activities.length, 1),
    make("move-500", "🏃", "500 active minutes", "500 minutes of movement logged", activeMinutes, 500),
    make("move-1000", "🚀", "A thousand minutes", "1,000 minutes of movement logged", activeMinutes, 1000),
    make("move-2500", "🦾", "2,500 strong", "2,500 minutes of movement logged", activeMinutes, 2500),
    make("move-streak-7", "⚡", "A week in motion", "Moved 7 days in a row", moveRun, 7),
    make("move-streak-14", "🌊", "Fortnight in motion", "Moved 14 days in a row", moveRun, 14),
    make("move-streak-30", "🏔️", "Unstoppable month", "Moved 30 days in a row", moveRun, 30),
    make("day-60", "⏰", "Hour of power", "60 active minutes in a single day", bestDayMinutes, 60),
    make("mi-26", "🎽", "Marathon distance", `${fmtDistance(26.2, unit)} of logged movement, all told`, totalMiles, 26.2),
    make("mi-50", "🛣️", "Fifty miles", `${fmtDistance(50, unit)} of logged movement, all told`, totalMiles, 50),
    make("mi-100", "🗺️", "The long haul", `${fmtDistance(100, unit)} of logged movement, all told`, totalMiles, 100),
    make("mi-250", "🛤️", "The long road", `${fmtDistance(250, unit)} of logged movement, all told`, totalMiles, 250),
    make("run-1", "💨", "Runner now", "First run logged", runs.length, 1),
    make("run-20", "⏱️", "Twenty nonstop", "A single run of 20+ minutes", longestRunMin, 20),
    make("run-5k", "🏁", "The full 5K", `One run covering ${fmtDistance(3.1, unit)}`, longestRunMi, 3.1),
    make("cross-3", "🤸", "Mix it up", "Three different activity types logged", typesUsed, 3),
    make("protein-7", "🥩", "Protein week", "Hit your protein goal 7 days", proteinDaysHit(data), 7),
    make("water-7", "💧", "Well watered", "Hit your water goal 7 days", waterDaysHit(data), 7),
    make("kcal-7", "📒", "Fuel ledger", "Calories logged 7 days", kcalDays, 7),
    make("kcal-30", "🧾", "Month of receipts", "Calories logged 30 days", kcalDays, 30),
    make("kcal-100", "🧮", "Hundred days of receipts", "Calories logged 100 days", kcalDays, 100),
    make("win-1", "🎉", "First win", "Logged a non-scale victory", data.wins.length, 1),
    make("win-10", "🌟", "Winning streak", "Ten non-scale victories", data.wins.length, 10),
    make("photo-1", "📸", "Snapshot", "First progress photo", data.photos.length, 1),
    make("photo-5", "🎞️", "Time-lapse", "Five progress photos", data.photos.length, 5),
    make("photo-12", "📽️", "A season on film", "Twelve progress photos — three months of proof", data.photos.length, 12),
    make("photo-26", "📚", "Half-year album", "26 progress photos", data.photos.length, 26),
    make("full-house", "🃏", "Full house", "Every log type used at least once — labs included", kindsLogged, 10),
    make("week-complete", "💎", "The complete week", "One week with a shot, daily weigh-ins & check-ins, 3 moves, tape, and photo", completeWeeks(data), 1),
  ];
}

export function newlyEarned(all: Achievement[], seen: string[]): Achievement[] {
  const seenSet = new Set(seen);
  return all.filter((a) => a.earned && !seenSet.has(a.key));
}
