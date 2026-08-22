import type { AppData, CheckinSlot } from "../../types";
import { SLOTS } from "../checkin";
import { mean, round1 } from "./shared";

export interface SlotAverage {
  slot: CheckinSlot;
  label: string;
  hunger?: number;
  energy?: number;
  /** hunger readings behind the average */
  n: number;
}

export interface TimeOfDay {
  slots: SlotAverage[];
  /** the hungriest part of the day, when the spread is notable */
  peak?: CheckinSlot;
  summary: string;
  energyNote?: string;
}

const MIN_PER_SLOT = 4;
const MIN_SLOTS = 2;
const NOTABLE = 0.7;

const TIPS: Record<CheckinSlot, string> = {
  morning: "a protein-forward breakfast tends to take the edge off.",
  afternoon: "a bigger, protein-heavy lunch and a planned snack beat grazing.",
  evening: "front-loading protein earlier in the day and an earlier dinner can blunt it.",
};

const emptyBuckets = (): Record<CheckinSlot, number[]> => ({ morning: [], afternoon: [], evening: [] });
const lower = (s: SlotAverage) => s.label.toLowerCase();

function energyNote(slots: SlotAverage[]): string | undefined {
  const ready = slots.filter((s) => s.energy != null && s.n >= MIN_PER_SLOT);
  if (ready.length < MIN_SLOTS) return undefined;
  const hi = ready.reduce((a, b) => (b.energy! > a.energy! ? b : a));
  const lo = ready.reduce((a, b) => (b.energy! < a.energy! ? b : a));
  if (hi.energy! - lo.energy! < NOTABLE) return undefined;
  return `Energy is lowest in the ${lower(lo)} (${round1(lo.energy!)}) — a good moment for a walk or water rather than a snack.`;
}

/** Average hunger/energy by time of day — does appetite build toward the evening? */
export function hungerByTimeOfDay(data: AppData): TimeOfDay | undefined {
  const hunger = emptyBuckets();
  const energy = emptyBuckets();
  for (const c of data.checkins) {
    for (const s of SLOTS) {
      const m = c.slots?.[s.key];
      if (m?.hunger != null) hunger[s.key].push(m.hunger);
      if (m?.energy != null) energy[s.key].push(m.energy);
    }
  }
  const slots: SlotAverage[] = SLOTS.map((s) => ({
    slot: s.key,
    label: s.label,
    hunger: mean(hunger[s.key]),
    energy: mean(energy[s.key]),
    n: hunger[s.key].length,
  }));
  const ready = slots.filter((s) => s.hunger != null && s.n >= MIN_PER_SLOT);
  if (ready.length < MIN_SLOTS) return undefined;

  const peak = ready.reduce((a, b) => (b.hunger! > a.hunger! ? b : a));
  const low = ready.reduce((a, b) => (b.hunger! < a.hunger! ? b : a));
  const notable = peak.hunger! - low.hunger! >= NOTABLE;
  const summary = notable
    ? `Hunger peaks in the ${lower(peak)} (${round1(peak.hunger!)}) and is lowest in the ${lower(low)} (${round1(low.hunger!)}) — ${TIPS[peak.slot]}`
    : `Your hunger is fairly even through the day (${ready.map((s) => `${lower(s)} ${round1(s.hunger!)}`).join(" · ")}).`;

  return { slots, peak: notable ? peak.slot : undefined, summary, energyNote: energyNote(slots) };
}
