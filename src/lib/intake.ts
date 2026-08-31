import type { AppData, DailyIntake, Unit } from "../types";
import { startOfDay } from "./dates";
import { DEFAULT_PROTEIN_GOAL_G, DEFAULT_WATER_GOAL_FL_OZ } from "./defaults";

export const GLASS_FL_OZ = 8;
export const ML_PER_FL_OZ = 29.5735;

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
