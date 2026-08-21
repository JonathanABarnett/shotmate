import type { AppData, Settings } from "../types";

export const DEFAULT_PROTEIN_GOAL_G = 100;
export const DEFAULT_WATER_GOAL_FL_OZ = 64;

export function defaultSettings(): Settings {
  return {
    name: "",
    medKey: "zepbound",
    scheduleDays: 7,
    plannedDoseMg: 2.5,
    unit: "lbs",
    theme: "auto",
  };
}

export function emptyData(): AppData {
  return {
    v: 1,
    onboarded: false,
    settings: defaultSettings(),
    shots: [],
    weights: [],
    effects: [],
    measures: [],
    photos: [],
    wins: [],
    intake: [],
    activities: [],
  };
}
