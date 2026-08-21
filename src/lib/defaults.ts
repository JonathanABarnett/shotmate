import type { AppData, Settings } from "../types";

export function defaultSettings(): Settings {
  return {
    name: "",
    medKey: "zepbound",
    scheduleDays: 7,
    plannedDoseMg: 2.5,
    unit: "lbs",
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
  };
}
