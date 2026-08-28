import type { AppData } from "../types";
import { weighInDayStreak } from "./achievements";
import { DAY, dayStreak, startOfDay } from "./dates";
import { absWeight } from "./format";
import { movementHabit } from "./insights/movement";
import { trendVsToday, trendWeightLbs } from "./insights/noiseTrend";
import { proteinGoal, todayIntake } from "./intake";
import { streak } from "./shots";
import { startWeightLbs } from "./weight";

/**
 * One true, kind sentence for the top bar — rotates daily through whatever
 * is genuinely going well, and says nothing rather than something hollow.
 */
export function heroLine(data: AppData, now = Date.now()): string | undefined {
  if (!data.onboarded) return undefined;
  const unit = data.settings.unit;
  const lines: string[] = [];

  const trend = trendVsToday(data, now);
  if (trend && trend.weeklyChangeLbs <= -0.5) {
    lines.push(`7-day trend: down ${absWeight(Math.abs(trend.weeklyChangeLbs), unit)} this week 📉`);
  }
  const start = startWeightLbs(data);
  const current = trendWeightLbs(data, now);
  if (start != null && current != null && start - current >= 2) {
    lines.push(`${absWeight(start - current, unit)} down since your start 🌟`);
  }
  const habit = movementHabit(data, now);
  if (habit && habit.streakDays >= 3) lines.push(`${habit.streakDays}-day walk streak — look at you 🚶`);
  const checkins = dayStreak(new Set(data.checkins.map((c) => c.day)), now);
  if (checkins >= 3) lines.push(`${checkins} straight days of check-ins ✅`);
  const weighs = weighInDayStreak(data, now);
  if (weighs >= 5) lines.push(`${weighs} days in a row on the scale 📅`);
  const onTime = streak(data.shots, data.settings.scheduleDays);
  if (onTime >= 2) lines.push(`${onTime} shots, every one on time 💜`);
  if ((todayIntake(data)?.proteinG ?? 0) >= proteinGoal(data)) lines.push("Protein goal hit today 🥩");

  if (lines.length === 0) return undefined;
  return lines[Math.floor(startOfDay(now) / DAY) % lines.length];
}
