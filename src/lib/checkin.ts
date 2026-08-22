import type { AppData, CheckinEntry, CheckinMoment, CheckinSlot, Scale5 } from "../types";
import { startOfDay } from "./dates";
import { mean } from "./insights/shared";

export const SCALE: Scale5[] = [1, 2, 3, 4, 5];

export const HUNGER_LABELS: Record<Scale5, string> = {
  1: "Not hungry",
  2: "A little",
  3: "Moderate",
  4: "Quite hungry",
  5: "Ravenous",
};

export const ENERGY_LABELS: Record<Scale5, string> = {
  1: "Drained",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

/** Last night's sleep — quality, not hours, so it's one tap. */
export const SLEEP_LABELS: Record<Scale5, string> = {
  1: "Rough night",
  2: "Broken",
  3: "Okay",
  4: "Solid",
  5: "Great",
};

export interface SlotMeta {
  key: CheckinSlot;
  label: string;
  emoji: string;
  /** first local hour that belongs to the slot */
  fromHour: number;
}

/** Morning · afternoon · evening — roughly breakfast, lunch, and dinner. */
export const SLOTS: SlotMeta[] = [
  { key: "morning", label: "Morning", emoji: "🌅", fromHour: 0 },
  { key: "afternoon", label: "Afternoon", emoji: "☀️", fromHour: 12 },
  { key: "evening", label: "Evening", emoji: "🌙", fromHour: 17 },
];

export function slotFor(ts: number): CheckinSlot {
  const hour = new Date(ts).getHours();
  return [...SLOTS].reverse().find((s) => hour >= s.fromHour)!.key;
}

/** Every hunger/energy reading on a day — its slots, plus the pre-slot reading older entries carry. */
export function momentsOf(entry: CheckinEntry): CheckinMoment[] {
  const slotted = SLOTS.flatMap((s) => (entry.slots?.[s.key] ? [entry.slots[s.key]!] : []));
  const legacy = entry.hunger != null || entry.energy != null ? [{ hunger: entry.hunger, energy: entry.energy }] : [];
  return [...slotted, ...legacy];
}

const readings = (entry: CheckinEntry, key: keyof CheckinMoment) =>
  momentsOf(entry).flatMap((m) => (m[key] != null ? [m[key]!] : []));

/** The day's average hunger across its check-ins (undefined when none). */
export const dayHunger = (entry: CheckinEntry) => mean(readings(entry, "hunger"));
export const dayEnergy = (entry: CheckinEntry) => mean(readings(entry, "energy"));

export function todayCheckin(data: AppData, now = Date.now()): CheckinEntry | undefined {
  const day = startOfDay(now);
  return data.checkins.find((c) => c.day === day);
}
