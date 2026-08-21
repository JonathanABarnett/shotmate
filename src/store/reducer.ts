import type { AppData, EffectEntry, Settings, Shot, WeightEntry } from "../types";
import { emptyData } from "../lib/defaults";
import { sampleData } from "../lib/sample";

export type CollectionKey = "shots" | "weights" | "effects";

export type Action =
  | { type: "completeOnboarding"; settings: Settings; firstWeight?: WeightEntry; firstShot?: Shot }
  | { type: "updateSettings"; patch: Partial<Settings> }
  | { type: "upsert"; collection: "shots"; item: Shot }
  | { type: "upsert"; collection: "weights"; item: WeightEntry }
  | { type: "upsert"; collection: "effects"; item: EffectEntry }
  | { type: "remove"; collection: CollectionKey; id: string }
  | { type: "loadSample" }
  | { type: "importData"; data: AppData }
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
  }
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
    case "loadSample":
      return sampleData(state.settings);
    case "importData":
      return action.data;
    case "wipe":
      return emptyData();
  }
}
