import type { AppData } from "../../types";
import { HOUR } from "../dates";
import { dayEnergy, dayHunger } from "../checkin";
import { cycleOffsetDays, mean, offsetLabel, round1 } from "./shared";

export interface CycleDayMood {
  offsetDays: number;
  label: string;
  hunger?: number;
  energy?: number;
  n: number;
}

export interface CreepInsight {
  buckets: CycleDayMood[];
  rising: boolean;
  summary: string;
  energyNote?: string;
}

const MIN_CHECKINS = 8;
const MIN_FILLED_BUCKETS = 3;
const RISE_THRESHOLD = 0.8;

/** Average hunger/energy for each day of the shot cycle. */
export function hungerEnergyByCycleDay(data: AppData): CreepInsight | undefined {
  if (data.shots.length === 0) return undefined;
  const span = Math.min(data.settings.scheduleDays, 14);
  const hunger: number[][] = Array.from({ length: span }, () => []);
  const energy: number[][] = Array.from({ length: span }, () => []);

  let total = 0;
  for (const c of data.checkins) {
    const offset = cycleOffsetDays(c.day + 12 * HOUR, data.shots);
    if (offset == null || offset >= span) continue;
    const h = dayHunger(c);
    const e = dayEnergy(c);
    if (h != null) hunger[offset].push(h);
    if (e != null) energy[offset].push(e);
    total++;
  }
  const buckets: CycleDayMood[] = hunger.map((h, i) => ({
    offsetDays: i,
    label: offsetLabel(i),
    hunger: mean(h),
    energy: mean(energy[i]),
    n: Math.max(h.length, energy[i].length),
  }));
  if (total < MIN_CHECKINS || buckets.filter((b) => b.n >= 2).length < MIN_FILLED_BUCKETS) return undefined;

  const early = mean(hunger.slice(0, 3).flat());
  const late = mean(hunger.slice(Math.max(3, span - 3)).flat());
  const rising = early != null && late != null && late - early >= RISE_THRESHOLD;
  const summary =
    early == null || late == null
      ? "Keep checking in — the cycle pattern sharpens with a few more days."
      : rising
        ? `Hunger climbs from about ${round1(early)} to ${round1(late)} by the end of your cycle — a pattern worth mentioning to your provider.`
        : `Hunger stays fairly steady across your cycle (${round1(early)} → ${round1(late)}).`;

  const earlyEnergy = mean(energy.slice(0, 2).flat());
  const laterEnergy = mean(energy.slice(2).flat());
  const energyNote =
    earlyEnergy != null && laterEnergy != null && laterEnergy - earlyEnergy >= RISE_THRESHOLD
      ? "Energy dips right after your shot and recovers within a couple of days."
      : undefined;

  return { buckets, rising, summary, energyNote };
}
