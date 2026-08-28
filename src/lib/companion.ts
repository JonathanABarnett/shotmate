import type { AppData } from "../types";
import { DAY, startOfDay } from "./dates";
import { heroLine } from "./encouragement";
import { effectTimingBuckets } from "./insights";
import { cycleOffsetDays } from "./insights/shared";
import { nextDueTs, sortedShots } from "./shots";
import { siteLabel, suggestedSite } from "./sites";

const AWAY_DAYS = 4;
const EVENING_HOUR = 17;
const LATE_HOUR = 19;
const ROUGH_MIN_COUNT = 2;

/** Most recent moment anything was logged. */
function lastLoggedTs(data: AppData): number | undefined {
  const stamps = [
    ...data.shots.map((s) => s.ts),
    ...data.weights.map((w) => w.ts),
    ...data.effects.map((e) => e.ts),
    ...data.measures.map((m) => m.ts),
    ...data.activities.map((a) => a.ts),
    ...data.wins.map((w) => w.ts),
    ...data.vitals.map((v) => v.ts),
    ...data.photos.map((p) => p.ts),
    ...data.checkins.map((c) => c.day),
    ...data.intake.map((i) => i.day),
  ];
  return stamps.length ? Math.max(...stamps) : undefined;
}

/** The cycle day side effects usually peak on, when the pattern is real. */
function roughOffset(data: AppData): number | undefined {
  const buckets = effectTimingBuckets(data);
  if (buckets.length === 0) return undefined;
  const peak = buckets.reduce((a, b) => (b.count > a.count ? b : a));
  return peak.count >= ROUGH_MIN_COUNT ? peak.offsetDays : undefined;
}

function shotMoment(data: AppData, now: number): string | undefined {
  const due = nextDueTs(data.shots, data.settings.scheduleDays);
  if (due == null) return undefined;
  const today = startOfDay(now);
  const dueDay = startOfDay(due);
  const hour = new Date(now).getHours();
  const site = siteLabel(suggestedSite(data.shots));
  if (dueDay <= today) return hour >= EVENING_HOUR ? `Shot tonight — ${site} is up next 💉` : `Shot day — ${site} is up next 💉`;
  if (dueDay === today + DAY && hour >= LATE_HOUR) return "Shot day tomorrow — nothing to do tonight but rest 💜";
  return undefined;
}

function roughDayMoment(data: AppData, now: number): string | undefined {
  const offset = cycleOffsetDays(now, data.shots);
  const rough = roughOffset(data);
  if (offset == null || offset === 0 || offset !== rough) return undefined;
  return `${offset} day${offset === 1 ? "" : "s"} after your shot — usually your loudest, and it fades 💛`;
}

function newDoseMoment(data: AppData, now: number): string | undefined {
  const shots = sortedShots(data.shots);
  const last = shots.at(-1);
  const previous = shots.at(-2);
  if (!last || !previous || last.doseMg <= previous.doseMg) return undefined;
  if (now - last.ts >= 7 * DAY) return undefined;
  return `First week at ${last.doseMg} mg — appetite often shifts around day 3–4 👀`;
}

/**
 * The words for right now: a warm welcome after days away, a time-aware
 * moment on the days that matter, and the daily encouragement rotation
 * when nothing special is happening.
 */
export function companionLine(data: AppData, now = Date.now()): string | undefined {
  if (!data.onboarded) return undefined;
  const lastTs = lastLoggedTs(data);
  if (lastTs != null && now - lastTs >= AWAY_DAYS * DAY) return "Welcome back — nothing lost, we pick up right here 💜";
  return shotMoment(data, now) ?? roughDayMoment(data, now) ?? newDoseMoment(data, now) ?? heroLine(data, now);
}
