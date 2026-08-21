export type Unit = "lbs" | "kg";

export type SiteId = "ab-l" | "ab-r" | "th-l" | "th-r" | "arm-l" | "arm-r";

export interface Shot {
  id: string;
  ts: number; // epoch ms
  doseMg: number;
  site: SiteId;
  note?: string;
}

export interface WeightEntry {
  id: string;
  ts: number;
  lbs: number; // canonical — converted for display when unit is kg
  note?: string;
}

export type Severity = 1 | 2 | 3;

export interface EffectEntry {
  id: string;
  ts: number;
  effects: string[];
  severity: Severity;
  note?: string;
}

export interface Settings {
  name: string;
  medKey: string;
  customMedName?: string;
  customHalfLifeH?: number;
  scheduleDays: number;
  plannedDoseMg: number;
  unit: Unit;
  goalLbs?: number;
  startLbs?: number;
  heightIn?: number;
  /** vial concentration for compounded meds — enables the draw calculator */
  vialMgPerMl?: number;
  /** mg on hand when the user last recorded their supply */
  supplyMg?: number;
  /** when supplyMg was recorded; shots after this count against it */
  supplySetTs?: number;
}

export interface AppData {
  v: 1;
  onboarded: boolean;
  sample?: boolean;
  settings: Settings;
  shots: Shot[];
  weights: WeightEntry[];
  effects: EffectEntry[];
}

export type Entry =
  | { kind: "shot"; item: Shot }
  | { kind: "weight"; item: WeightEntry }
  | { kind: "effect"; item: EffectEntry };
