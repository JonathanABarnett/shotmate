import type { ActivityEntry, ActivityType, Unit } from "../types";
import { DAY } from "./dates";

export const KM_PER_MI = 1.60934;

export interface ActivityTypeInfo {
  key: ActivityType;
  label: string;
  emoji: string;
}

export const ACTIVITY_TYPES: ActivityTypeInfo[] = [
  { key: "run", label: "Run", emoji: "🏃" },
  { key: "walk", label: "Walk", emoji: "🚶" },
  { key: "ride", label: "Ride", emoji: "🚴" },
  { key: "strength", label: "Strength", emoji: "🏋️" },
  { key: "other", label: "Other", emoji: "🎯" },
];

export function activityTypeInfo(type: ActivityType): ActivityTypeInfo {
  return ACTIVITY_TYPES.find((t) => t.key === type) ?? ACTIVITY_TYPES[4];
}

/** Distance shows in miles for lbs users and km for kg users. */
export function fmtDistance(distanceMi: number, unit: Unit): string {
  return unit === "lbs" ? `${distanceMi.toFixed(1)} mi` : `${(distanceMi * KM_PER_MI).toFixed(1)} km`;
}

export function distanceUnit(unit: Unit): "mi" | "km" {
  return unit === "lbs" ? "mi" : "km";
}

function weekStart(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}

export interface WeekBucket {
  ts: number;
  minutes: number;
  sessions: number;
}

/** Minutes per week for the last `weeks` weeks, oldest first (current week included). */
export function weeklyActivity(activities: ActivityEntry[], weeks = 8, now = Date.now()): WeekBucket[] {
  const current = weekStart(now);
  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, i) => ({
    ts: current - (weeks - 1 - i) * 7 * DAY,
    minutes: 0,
    sessions: 0,
  }));
  const byTs = new Map(buckets.map((b) => [b.ts, b]));
  for (const a of activities) {
    const bucket = byTs.get(weekStart(a.ts));
    if (bucket) {
      bucket.minutes += a.minutes;
      bucket.sessions += 1;
    }
  }
  return buckets;
}

/** Stable identity for deduping imported workouts against what's already logged. */
export function activityDedupeKey(a: Pick<ActivityEntry, "ts" | "minutes" | "type">): string {
  return `${Math.round(a.ts / 60_000)}|${a.type}|${Math.round(a.minutes)}`;
}
