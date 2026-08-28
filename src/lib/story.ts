import type { AppData } from "../types";
import { DAY } from "./dates";
import { trendWeightLbs } from "./insights/noiseTrend";
import { medFor } from "./meds";
import { sortedShots, streak } from "./shots";
import { fmtWeight, startWeightLbs } from "./weight";

export interface MonthStory {
  key: string;
  month: number;
  title: string;
  sub: string;
  lines: string[];
  winText: string;
}

const WINDOW_DAYS = 4;

/** The k-th month anniversary of a timestamp, clamped for short months. */
function anniversary(ts: number, k: number): number {
  const d = new Date(ts);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + k + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth() + k, Math.min(d.getDate(), lastDay)).getTime();
}

/** A narrative recap on each month-versary of the first shot — the story so far, worth keeping. */
export function monthStory(data: AppData, now = Date.now()): MonthStory | undefined {
  if (data.sample || !data.onboarded) return undefined;
  const first = sortedShots(data.shots)[0];
  if (!first) return undefined;
  let month = 0;
  while (anniversary(first.ts, month + 1) <= now) month++;
  if (month < 1 || now - anniversary(first.ts, month) >= WINDOW_DAYS * DAY) return undefined;
  const key = `month-${month}`;
  if (data.seenAchievements.includes(key)) return undefined;

  const unit = data.settings.unit;
  const medName = medFor(data.settings).generic.split(" ·")[0];
  const start = startWeightLbs(data);
  const trend = trendWeightLbs(data, now);
  const lost = start != null && trend != null ? Math.max(0, start - trend) : 0;
  const lostLabel = fmtWeight(lost, unit);
  const onTime = streak(data.shots, data.settings.scheduleDays);
  const activeMinutes = data.activities.reduce((sum, a) => sum + a.minutes, 0);

  const lines: string[] = [];
  if (lost >= 1) lines.push(`${lostLabel} down on the 7-day trend`);
  lines.push(onTime >= data.shots.length && data.shots.length > 1 ? `${data.shots.length} shots — every one on time` : `${data.shots.length} shots logged`);
  if (activeMinutes >= 60) lines.push(`${data.activities.length} activities · ${activeMinutes} active minutes`);
  if (data.checkins.length >= 5) lines.push(`${data.checkins.length} days checked in`);
  if (data.wins.length > 0) lines.push(`${data.wins.length} win${data.wins.length === 1 ? "" : "s"} on the board`);

  const monthWord = month === 1 ? "One month" : `${month} months`;
  return {
    key,
    month,
    title: `${monthWord} on ${medName} 💜`,
    sub: month === 1 ? "Month one: complete. Look at what you built." : `Month ${month}: complete. Still building.`,
    lines,
    winText: lost >= 1 ? `${monthWord} in — ${lostLabel} down 🎉` : `${monthWord} in — showed up every week 🎉`,
  };
}
