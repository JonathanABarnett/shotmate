import type {
  ActivityEntry,
  AppData,
  CheckinEntry,
  CheckinMoment,
  CheckinSlot,
  EffectEntry,
  MeasurementEntry,
  PhotoEntry,
  Scale5,
  Settings,
  Shot,
  VitalsEntry,
  WeightEntry,
  WinEntry,
} from "../types";
import { slotFor } from "../lib/checkin";
import { emptyData } from "../lib/defaults";
import { startOfDay } from "../lib/dates";
import { uid } from "../lib/ids";
import { sampleData } from "../lib/sample";

export type CollectionKey = "shots" | "weights" | "effects" | "measures" | "photos" | "wins" | "activities" | "vitals";

export type Action =
  | { type: "completeOnboarding"; settings: Settings; firstWeight?: WeightEntry; firstShot?: Shot }
  | { type: "updateSettings"; patch: Partial<Settings> }
  | { type: "upsert"; collection: "shots"; item: Shot }
  | { type: "upsert"; collection: "weights"; item: WeightEntry }
  | { type: "upsert"; collection: "effects"; item: EffectEntry }
  | { type: "upsert"; collection: "measures"; item: MeasurementEntry }
  | { type: "upsert"; collection: "photos"; item: PhotoEntry }
  | { type: "upsert"; collection: "wins"; item: WinEntry }
  | { type: "upsert"; collection: "activities"; item: ActivityEntry }
  | { type: "upsert"; collection: "vitals"; item: VitalsEntry }
  | { type: "remove"; collection: CollectionKey; id: string }
  | { type: "addIntake"; ts: number; proteinG?: number; waterFlOz?: number; kcal?: number }
  | { type: "importIntake"; days: { day: number; kcal?: number; proteinG?: number }[] }
  | { type: "addActivities"; items: ActivityEntry[] }
  | { type: "setCheckin"; ts: number; slot?: CheckinSlot; hunger?: Scale5; energy?: Scale5; sleep?: Scale5 }
  | { type: "markAchievementsSeen"; keys: string[] }
  | { type: "loadSample" }
  | { type: "importData"; data: AppData }
  | { type: "replaceFromSync"; data: AppData }
  | { type: "wipe" };

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  return items.some((x) => x.id === item.id)
    ? items.map((x) => (x.id === item.id ? item : x))
    : [...items, item];
}

function removeById<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((x) => x.id !== id);
}

function completeOnboarding(state: AppData, action: Extract<Action, { type: "completeOnboarding" }>): AppData {
  return {
    ...state,
    onboarded: true,
    sample: false,
    settings: action.settings,
    shots: action.firstShot ? upsertById(state.shots, action.firstShot) : state.shots,
    weights: action.firstWeight ? upsertById(state.weights, action.firstWeight) : state.weights,
  };
}

function applyUpsert(state: AppData, action: Extract<Action, { type: "upsert" }>): AppData {
  switch (action.collection) {
    case "shots":
      return { ...state, shots: upsertById(state.shots, action.item) };
    case "weights":
      return { ...state, weights: upsertById(state.weights, action.item) };
    case "effects":
      return { ...state, effects: upsertById(state.effects, action.item) };
    case "measures":
      return { ...state, measures: upsertById(state.measures, action.item) };
    case "photos":
      return { ...state, photos: upsertById(state.photos, action.item) };
    case "wins":
      return { ...state, wins: upsertById(state.wins, action.item) };
    case "activities":
      return { ...state, activities: upsertById(state.activities, action.item) };
    case "vitals":
      return { ...state, vitals: upsertById(state.vitals, action.item) };
  }
}

function applyRemove(state: AppData, action: Extract<Action, { type: "remove" }>): AppData {
  switch (action.collection) {
    case "shots":
      return { ...state, shots: removeById(state.shots, action.id) };
    case "weights":
      return { ...state, weights: removeById(state.weights, action.id) };
    case "effects":
      return { ...state, effects: removeById(state.effects, action.id) };
    case "measures":
      return { ...state, measures: removeById(state.measures, action.id) };
    case "photos":
      return { ...state, photos: removeById(state.photos, action.id) };
    case "wins":
      return { ...state, wins: removeById(state.wins, action.id) };
    case "activities":
      return { ...state, activities: removeById(state.activities, action.id) };
    case "vitals":
      return { ...state, vitals: removeById(state.vitals, action.id) };
  }
}

/** Accumulate protein/water into the entry for that day, clamped at zero. */
function applyAddIntake(state: AppData, action: Extract<Action, { type: "addIntake" }>): AppData {
  const day = startOfDay(action.ts);
  const existing = state.intake.find((i) => i.day === day);
  const base = existing ?? { id: uid(), day, proteinG: 0, waterFlOz: 0 };
  const kcal = Math.max(0, (base.kcal ?? 0) + (action.kcal ?? 0));
  const updated = {
    ...base,
    proteinG: Math.max(0, base.proteinG + (action.proteinG ?? 0)),
    waterFlOz: Math.max(0, base.waterFlOz + (action.waterFlOz ?? 0)),
    kcal: kcal > 0 ? kcal : undefined,
  };
  return { ...state, intake: upsertById(state.intake, updated) };
}

/** Merge imported day totals — the CSV is the source of truth for calories and protein. */
function applyImportIntake(state: AppData, action: Extract<Action, { type: "importIntake" }>): AppData {
  let intake = state.intake;
  for (const d of action.days) {
    const base = intake.find((i) => i.day === d.day) ?? { id: uid(), day: d.day, proteinG: 0, waterFlOz: 0 };
    intake = upsertById(intake, {
      ...base,
      ...(d.kcal != null ? { kcal: d.kcal } : {}),
      ...(d.proteinG != null ? { proteinG: d.proteinG } : {}),
    });
  }
  return { ...state, intake };
}

/** Record a check-in — sleep merges into the day, hunger/energy into that time-of-day slot. */
function applySetCheckin(state: AppData, action: Extract<Action, { type: "setCheckin" }>): AppData {
  const day = startOfDay(action.ts);
  const existing = state.checkins.find((c) => c.day === day);
  const slot = action.slot ?? slotFor(action.ts);
  const hasReading = action.hunger != null || action.energy != null;
  const moment: CheckinMoment = {
    ...existing?.slots?.[slot],
    ...(action.hunger != null ? { hunger: action.hunger } : {}),
    ...(action.energy != null ? { energy: action.energy } : {}),
  };
  const updated: CheckinEntry = {
    ...existing,
    id: existing?.id ?? uid(),
    day,
    sleep: action.sleep ?? existing?.sleep,
    slots: hasReading ? { ...existing?.slots, [slot]: moment } : existing?.slots,
  };
  return { ...state, checkins: upsertById(state.checkins, updated) };
}

export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "completeOnboarding":
      return completeOnboarding(state, action);
    case "updateSettings":
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case "upsert":
      return applyUpsert(state, action);
    case "remove":
      return applyRemove(state, action);
    case "addIntake":
      return applyAddIntake(state, action);
    case "importIntake":
      return applyImportIntake(state, action);
    case "addActivities":
      return { ...state, activities: [...state.activities, ...action.items] };
    case "setCheckin":
      return applySetCheckin(state, action);
    case "markAchievementsSeen":
      return { ...state, seenAchievements: [...new Set([...state.seenAchievements, ...action.keys])] };
    case "loadSample":
      return sampleData(state.settings);
    case "importData":
    case "replaceFromSync":
      return action.data;
    case "wipe":
      return emptyData();
  }
}
