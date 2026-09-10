import type { AppData } from "../types";
import { achievements } from "./achievements";
import { activityTypeInfo } from "./activity";
import { DAY, HOUR, startOfDay } from "./dates";
import { trendLossLbs } from "./insights/noiseTrend";
import { MILESTONE_KEYS, milestoneStops } from "./milestones";
import { isLongestYet } from "./records";

export type MomentKind = "badge" | "milestone" | "record" | "win";

/** One entry in the trophy room — derived from the data, never stored, so dates are always right. */
export interface Moment {
  key: string;
  ts: number;
  kind: MomentKind;
  emoji: string;
  title: string;
  detail?: string;
}

/** The data as it stood at the end of `ts` — for replaying history. */
function dataUpTo(data: AppData, ts: number): AppData {
  const upTo = <T extends { ts: number }>(items: T[]) => items.filter((i) => i.ts <= ts);
  return {
    ...data,
    shots: upTo(data.shots),
    weights: upTo(data.weights),
    effects: upTo(data.effects),
    measures: upTo(data.measures),
    photos: upTo(data.photos),
    wins: upTo(data.wins),
    activities: upTo(data.activities),
    vitals: upTo(data.vitals),
    intake: data.intake.filter((i) => i.day <= ts),
    checkins: data.checkins.filter((c) => c.day <= ts),
  };
}

function firstLogTs(data: AppData): number | undefined {
  const stamped = [...data.shots, ...data.weights, ...data.effects, ...data.measures, ...data.photos, ...data.wins, ...data.activities, ...data.vitals];
  const first = Math.min(...stamped.map((e) => e.ts), ...[...data.intake, ...data.checkins].map((e) => e.day));
  return Number.isFinite(first) ? first : undefined;
}

/** Badges and milestones, each stamped with the day the data first earned it. */
function replayedMoments(data: AppData, now: number): Moment[] {
  const first = firstLogTs(data);
  if (first == null) return [];
  const out: Moment[] = [];
  const seen = new Set<string>();
  const stops = milestoneStops(data);
  const today = startOfDay(now);
  // step by local midnights (25h then floor) so DST changeovers don't skip or repeat a day
  for (let day = startOfDay(first); day <= today; day = startOfDay(day + DAY + HOUR)) {
    const end = Math.min(startOfDay(day + DAY + HOUR) - 1, now);
    const snapshot = dataUpTo(data, end);
    for (const a of achievements(snapshot, end)) {
      if (!a.earned || MILESTONE_KEYS.has(a.key) || seen.has(a.key)) continue;
      seen.add(a.key);
      out.push({ key: `badge:${a.key}`, ts: end, kind: "badge", emoji: a.emoji, title: a.title, detail: a.desc });
    }
    const lost = trendLossLbs(snapshot, end);
    if (lost == null) continue;
    for (const s of stops) {
      if (lost < s.atLostLbs || seen.has(s.key)) continue;
      seen.add(s.key);
      out.push({ key: `milestone:${s.key}`, ts: end, kind: "milestone", emoji: s.emoji, title: s.title, detail: "On the 7-day average" });
    }
  }
  return out;
}

/** Every activity that was the longest yet when it happened — the same rule the toast uses. */
function recordMoments(data: AppData): Moment[] {
  const sorted = [...data.activities].sort((a, b) => a.ts - b.ts);
  return sorted.flatMap((a, i) => {
    if (!isLongestYet(sorted.slice(0, i), a)) return [];
    const info = activityTypeInfo(a.type);
    return [{ key: `record:${a.id}`, ts: a.ts, kind: "record" as const, emoji: info.emoji, title: `Longest one yet — ${a.minutes} minutes`, detail: info.label }];
  });
}

function winMoments(data: AppData): Moment[] {
  return data.wins.map((w) => ({ key: `win:${w.id}`, ts: w.ts, kind: "win" as const, emoji: "🎉", title: w.text, detail: "Non-scale victory" }));
}

/** The whole trophy room, newest first. */
export function moments(data: AppData, now = Date.now()): Moment[] {
  return [...replayedMoments(data, now), ...recordMoments(data), ...winMoments(data)].sort((a, b) => b.ts - a.ts);
}

/** When each badge or milestone key was first earned. */
export function earnedDates(feed: Moment[]): Map<string, number> {
  const dates = new Map<string, number>();
  for (const m of feed) {
    if (m.kind === "badge" || m.kind === "milestone") dates.set(m.key.slice(m.key.indexOf(":") + 1), m.ts);
  }
  return dates;
}
