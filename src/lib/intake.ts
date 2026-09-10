import type { AppData, DailyIntake, Unit } from "../types";
import { DAY, startOfDay } from "./dates";
import { DEFAULT_PROTEIN_GOAL_G, DEFAULT_WATER_GOAL_FL_OZ } from "./defaults";

export const GLASS_FL_OZ = 8;
export const ML_PER_FL_OZ = 29.5735;
const INFER_WINDOW_DAYS = 14;

/** Calories-only fuel tracking: the explicit setting wins; otherwise recent calories with no protein or water says so. */
export function caloriesOnly(data: AppData, now = Date.now()): boolean {
  if (data.settings.calorieOnlyFuel != null) return data.settings.calorieOnlyFuel;
  const since = startOfDay(now) - INFER_WINDOW_DAYS * DAY;
  const recent = data.intake.filter((i) => i.day >= since);
  const kcalLogged = recent.some((i) => (i.kcal ?? 0) > 0);
  const macrosLogged = recent.some((i) => i.proteinG > 0 || i.waterFlOz > 0);
  return kcalLogged && !macrosLogged;
}

export function todayIntake(data: AppData, now = Date.now()): DailyIntake | undefined {
  const day = startOfDay(now);
  return data.intake.find((i) => i.day === day);
}

export function proteinGoal(data: AppData): number {
  return data.settings.proteinGoalG ?? DEFAULT_PROTEIN_GOAL_G;
}

export function waterGoalFlOz(data: AppData): number {
  return data.settings.waterGoalFlOz ?? DEFAULT_WATER_GOAL_FL_OZ;
}

/** No default — a budget only shows once the user sets one (e.g. from Lose It). */
export function calorieBudget(data: AppData): number | undefined {
  return data.settings.calorieBudgetKcal;
}

/** Water displays in fl oz for lbs users and ml for kg users. */
export function fmtWater(flOz: number, unit: Unit): string {
  return unit === "lbs" ? `${Math.round(flOz)} oz` : `${Math.round(flOz * ML_PER_FL_OZ)} ml`;
}
