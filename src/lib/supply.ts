import type { AppData } from "../types";
import { DAY } from "./dates";
import { lastShot } from "./shots";

export interface SupplyStatus {
  remainingMg: number;
  /** full planned doses left in the vials */
  shotsLeft: number;
  /** approximate date the supply runs dry, given the current schedule */
  runOutTs?: number;
  /** runOut minus the reorder lead time */
  orderByTs?: number;
  low: boolean;
  /** cost figures — only when the supply's price is recorded */
  costPerMg?: number;
  costPerShot?: number;
  costPerWeek?: number;
}

const LOW_SHOTS = 2;
export const DEFAULT_REORDER_LEAD_DAYS = 7;

/** Vial inventory: what was recorded, minus every shot logged since. */
export function supplyStatus(data: AppData): SupplyStatus | undefined {
  const { supplyMg, supplySetTs, plannedDoseMg, scheduleDays, supplyCostUsd, reorderLeadDays } = data.settings;
  if (supplyMg == null || supplySetTs == null) return undefined;

  const usedMg = data.shots.filter((s) => s.ts > supplySetTs).reduce((sum, s) => sum + s.doseMg, 0);
  const remainingMg = Math.max(0, Math.round((supplyMg - usedMg) * 100) / 100);
  const shotsLeft = plannedDoseMg > 0 ? Math.floor(remainingMg / plannedDoseMg) : 0;
  const base = lastShot(data.shots)?.ts ?? Date.now();
  const runOutTs = shotsLeft > 0 ? base + shotsLeft * scheduleDays * DAY : undefined;
  const lead = reorderLeadDays ?? DEFAULT_REORDER_LEAD_DAYS;

  const costPerMg = supplyCostUsd != null && supplyMg > 0 ? supplyCostUsd / supplyMg : undefined;
  const costPerShot = costPerMg != null ? costPerMg * plannedDoseMg : undefined;

  return {
    remainingMg,
    shotsLeft,
    runOutTs,
    orderByTs: runOutTs != null ? runOutTs - lead * DAY : undefined,
    low: shotsLeft <= LOW_SHOTS,
    costPerMg,
    costPerShot,
    costPerWeek: costPerShot != null && scheduleDays > 0 ? (costPerShot * 7) / scheduleDays : undefined,
  };
}

export function fmtUsd(amount: number): string {
  return amount.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: amount >= 100 ? 0 : 2 });
}
