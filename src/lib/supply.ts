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
  /** the vial's beyond-use date and how many days remain before it — undefined until recorded */
  budTs?: number;
  budDaysLeft?: number;
  /** the vial expires before the doses in it would be used up */
  budBeforeRunOut: boolean;
}

const LOW_SHOTS = 2;
/** how far ahead the beyond-use date starts showing up on the card and as a nudge */
export const BUD_WARN_DAYS = 7;
export const DEFAULT_REORDER_LEAD_DAYS = 7;

/** Vial inventory: what was recorded, minus every shot logged since. */
export function supplyStatus(data: AppData, now = Date.now()): SupplyStatus | undefined {
  const { supplyMg, supplySetTs, plannedDoseMg, scheduleDays, supplyCostUsd, reorderLeadDays, vialBudTs } = data.settings;
  if (supplyMg == null || supplySetTs == null) return undefined;

  const usedMg = data.shots.filter((s) => s.ts > supplySetTs).reduce((sum, s) => sum + s.doseMg, 0);
  const remainingMg = Math.max(0, Math.round((supplyMg - usedMg) * 100) / 100);
  const shotsLeft = plannedDoseMg > 0 ? Math.floor(remainingMg / plannedDoseMg) : 0;
  const base = lastShot(data.shots)?.ts ?? now;
  const runOutTs = shotsLeft > 0 ? base + shotsLeft * scheduleDays * DAY : undefined;
  const lead = reorderLeadDays ?? DEFAULT_REORDER_LEAD_DAYS;

  const costPerMg = supplyCostUsd != null && supplyMg > 0 ? supplyCostUsd / supplyMg : undefined;
  const costPerShot = costPerMg != null ? costPerMg * plannedDoseMg : undefined;
  const budDaysLeft = vialBudTs != null ? Math.ceil((vialBudTs - now) / DAY) : undefined;

  return {
    remainingMg,
    shotsLeft,
    runOutTs,
    orderByTs: runOutTs != null ? runOutTs - lead * DAY : undefined,
    low: shotsLeft <= LOW_SHOTS,
    budTs: vialBudTs,
    budDaysLeft,
    budBeforeRunOut: vialBudTs != null && runOutTs != null && vialBudTs < runOutTs,
    costPerMg,
    costPerShot,
    costPerWeek: costPerShot != null && scheduleDays > 0 ? (costPerShot * 7) / scheduleDays : undefined,
  };
}

export function fmtUsd(amount: number): string {
  return amount.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: amount >= 100 ? 0 : 2 });
}
