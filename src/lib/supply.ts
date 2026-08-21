import type { AppData } from "../types";
import { DAY } from "./dates";
import { lastShot } from "./shots";

export interface SupplyStatus {
  remainingMg: number;
  /** full planned doses left in the vials */
  shotsLeft: number;
  /** approximate date the supply runs dry, given the current schedule */
  runOutTs?: number;
  low: boolean;
}

const LOW_SHOTS = 2;

/** Vial inventory: what was recorded, minus every shot logged since. */
export function supplyStatus(data: AppData): SupplyStatus | undefined {
  const { supplyMg, supplySetTs, plannedDoseMg, scheduleDays } = data.settings;
  if (supplyMg == null || supplySetTs == null) return undefined;

  const usedMg = data.shots
    .filter((s) => s.ts > supplySetTs)
    .reduce((sum, s) => sum + s.doseMg, 0);
  const remainingMg = Math.max(0, Math.round((supplyMg - usedMg) * 100) / 100);

  const shotsLeft = plannedDoseMg > 0 ? Math.floor(remainingMg / plannedDoseMg) : 0;
  const base = lastShot(data.shots)?.ts ?? Date.now();
  return {
    remainingMg,
    shotsLeft,
    runOutTs: shotsLeft > 0 ? base + shotsLeft * scheduleDays * DAY : undefined,
    low: shotsLeft <= LOW_SHOTS,
  };
}
