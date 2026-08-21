import type { Shot } from "../types";
import { DAY, daysBetween } from "./dates";

const GRACE_DAYS = 1.5;

export function sortedShots(shots: Shot[]): Shot[] {
  return [...shots].sort((a, b) => a.ts - b.ts);
}

export function lastShot(shots: Shot[]): Shot | undefined {
  return sortedShots(shots).at(-1);
}

export function nextDueTs(shots: Shot[], scheduleDays: number): number | undefined {
  const last = lastShot(shots);
  return last ? last.ts + scheduleDays * DAY : undefined;
}

/** 0..1 of the way through the current shot cycle. */
export function cycleProgress(shots: Shot[], scheduleDays: number, now = Date.now()): number {
  const last = lastShot(shots);
  if (!last) return 0;
  return Math.max(0, Math.min(1, (now - last.ts) / (scheduleDays * DAY)));
}

/** Consecutive on-time shots, counted back from the latest. */
export function streak(shots: Shot[], scheduleDays: number): number {
  const sorted = sortedShots(shots);
  if (sorted.length === 0) return 0;
  let count = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const gap = sorted[i].ts - sorted[i - 1].ts;
    if (gap > (scheduleDays + GRACE_DAYS) * DAY) break;
    count++;
  }
  return count;
}

export interface DueInfo {
  text: string;
  days: number;
  state: "future" | "today" | "overdue";
}

/** "in 3 days" / "today" / "2 days overdue" */
export function dueInfo(dueTs: number, now = Date.now()): DueInfo {
  const days = daysBetween(now, dueTs);
  if (days > 1) return { text: `in ${days} days`, days, state: "future" };
  if (days === 1) return { text: "tomorrow", days, state: "future" };
  if (days === 0) return { text: "today", days, state: "today" };
  const late = Math.abs(days);
  return { text: `${late} ${late === 1 ? "day" : "days"} overdue`, days, state: "overdue" };
}
