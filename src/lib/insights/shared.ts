import type { Shot } from "../../types";
import { daysBetween } from "../dates";
import { sortedShots } from "../shots";

/** Calendar days since the most recent shot at or before ts (shot day = 0); undefined before the first shot. */
export function cycleOffsetDays(ts: number, shots: Shot[]): number | undefined {
  let last: Shot | undefined;
  for (const s of sortedShots(shots)) {
    if (s.ts <= ts) last = s;
    else break;
  }
  return last ? daysBetween(last.ts, ts) : undefined;
}

export function mean(values: number[]): number | undefined {
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : undefined;
}

export function offsetLabel(days: number): string {
  if (days === 0) return "Shot day";
  if (days === 1) return "1 day after";
  return `${days} days after`;
}

export const round1 = (n: number): number => Math.round(n * 10) / 10;
