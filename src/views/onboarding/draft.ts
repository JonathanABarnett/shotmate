import type { Settings, Unit, WeightEntry } from "../../types";
import { defaultSettings } from "../../lib/defaults";
import { uid } from "../../lib/ids";
import { parseWeightInput } from "../../components/form/WeightInput";
import { fromDisplayWeight } from "../../lib/weight";

export interface OnboardingDraft {
  name: string;
  medKey: string;
  customMedName: string;
  doseMg: number;
  scheduleDays: number;
  unit: Unit;
  currentWeightText: string;
  goalWeightText: string;
  heightIn: number | undefined;
}

export function emptyDraft(): OnboardingDraft {
  const base = defaultSettings();
  return {
    name: "",
    medKey: base.medKey,
    customMedName: "",
    doseMg: base.plannedDoseMg,
    scheduleDays: base.scheduleDays,
    unit: base.unit,
    currentWeightText: "",
    goalWeightText: "",
    heightIn: undefined,
  };
}

function draftWeightLbs(text: string, unit: Unit): number | undefined {
  const parsed = parseWeightInput(text);
  return parsed != null ? Math.round(fromDisplayWeight(parsed, unit) * 100) / 100 : undefined;
}

export interface OnboardingResult {
  settings: Settings;
  firstWeight?: WeightEntry;
}

/** Turn the finished draft into settings + an optional first weigh-in. */
export function draftToResult(draft: OnboardingDraft): OnboardingResult {
  const currentLbs = draftWeightLbs(draft.currentWeightText, draft.unit);
  const settings: Settings = {
    name: draft.name.trim(),
    medKey: draft.medKey,
    customMedName: draft.medKey === "custom" ? draft.customMedName.trim() || undefined : undefined,
    scheduleDays: draft.scheduleDays,
    plannedDoseMg: draft.doseMg,
    unit: draft.unit,
    startLbs: currentLbs,
    goalLbs: draftWeightLbs(draft.goalWeightText, draft.unit),
    heightIn: draft.heightIn,
  };
  return {
    settings,
    firstWeight: currentLbs != null ? { id: uid(), ts: Date.now(), lbs: currentLbs } : undefined,
  };
}
