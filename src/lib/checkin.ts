import type { AppData, CheckinEntry, Scale5 } from "../types";
import { startOfDay } from "./dates";

export const SCALE: Scale5[] = [1, 2, 3, 4, 5];

export const HUNGER_LABELS: Record<Scale5, string> = {
  1: "Not hungry",
  2: "A little",
  3: "Moderate",
  4: "Quite hungry",
  5: "Ravenous",
};

export const ENERGY_LABELS: Record<Scale5, string> = {
  1: "Drained",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

export function todayCheckin(data: AppData, now = Date.now()): CheckinEntry | undefined {
  const day = startOfDay(now);
  return data.checkins.find((c) => c.day === day);
}
