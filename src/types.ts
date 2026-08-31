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

export type MeasureKey = "chest" | "waist" | "stomach" | "hips" | "arm" | "thigh";

export interface MeasurementEntry {
  id: string;
  ts: number;
  /** inches canonical — converted for display when unit is kg/cm */
  valuesIn: Partial<Record<MeasureKey, number>>;
  note?: string;
}

/** Where a photo's fixed-frame crops center, 0..1 per axis (like CSS object-position). */
export interface PhotoFocus {
  x: number;
  y: number;
}

/** Photo pixels live in IndexedDB under the same id — only metadata sits here. */
export interface PhotoEntry {
  id: string;
  ts: number;
  note?: string;
  focus?: PhotoFocus;
}

/** A non-scale victory. */
export interface WinEntry {
  id: string;
  ts: number;
  text: string;
}

export type ActivityType = "run" | "walk" | "ride" | "strength" | "other";

export interface ActivityEntry {
  id: string;
  ts: number;
  type: ActivityType;
  minutes: number;
  /** miles canonical — shown as km for kg users */
  distanceMi?: number;
  note?: string;
  /** set when the entry came from a MapMyRun CSV import */
  imported?: boolean;
}

export type VitalKey = "systolic" | "diastolic" | "restingHr" | "a1c" | "fastingGlucose" | "ldl" | "hdl" | "triglycerides";

/** A labs/vitals check-in — fill in whichever values you have. */
export interface VitalsEntry {
  id: string;
  ts: number;
  values: Partial<Record<VitalKey, number>>;
  note?: string;
}

/** One day's running fuel totals (day = local start-of-day ms). */
export interface DailyIntake {
  id: string;
  day: number;
  proteinG: number;
  waterFlOz: number;
  /** the day's calorie total — typed in or imported from Lose It */
  kcal?: number;
}

export type Scale5 = 1 | 2 | 3 | 4 | 5;

export type CheckinSlot = "morning" | "afternoon" | "evening";

/** One hunger/energy reading — at most one per slot per day. */
export interface CheckinMoment {
  hunger?: Scale5;
  energy?: Scale5;
}

/** A day's check-ins (day = local start-of-day ms): sleep once, hunger/energy per time of day. */
export interface CheckinEntry {
  id: string;
  day: number;
  /** last night's sleep quality */
  sleep?: Scale5;
  slots?: Partial<Record<CheckinSlot, CheckinMoment>>;
  /** pre-slot readings with no time of day — old entries only; read via momentsOf() */
  hunger?: Scale5;
  energy?: Scale5;
}

export type ThemePref = "auto" | "light" | "dark";

/** Optional Home cards the user can hide in Settings → Appearance. */
export type HomeCardKey = "checkin" | "cycle" | "intake" | "goal" | "photos";

export type BodyType = "neutral" | "slim" | "broad" | "curvy";

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
  /** what the recorded supply cost, for per-week / per-mg figures */
  supplyCostUsd?: number;
  /** days before running out that you want to reorder by */
  reorderLeadDays?: number;
  theme?: ThemePref;
  /** silhouette used by the body snapshot and the injection-site picker */
  bodyType?: BodyType;
  /** show the site picker as you look down at yourself (your left on the left) */
  siteMapMirror?: boolean;
  /** Home cards the user chose to hide */
  hiddenHomeCards?: HomeCardKey[];
  proteinGoalG?: number;
  waterGoalFlOz?: number;
  /** daily calorie budget, e.g. from Lose It — display only */
  calorieBudgetKcal?: number;
}

export interface AppData {
  v: 1;
  onboarded: boolean;
  sample?: boolean;
  settings: Settings;
  shots: Shot[];
  weights: WeightEntry[];
  effects: EffectEntry[];
  measures: MeasurementEntry[];
  photos: PhotoEntry[];
  wins: WinEntry[];
  intake: DailyIntake[];
  activities: ActivityEntry[];
  checkins: CheckinEntry[];
  vitals: VitalsEntry[];
  /** achievement keys already celebrated, so unlock toasts fire once */
  seenAchievements: string[];
  /** last local change, ms — drives last-write-wins sync */
  updatedAt?: number;
}

export type Entry =
  | { kind: "shot"; item: Shot }
  | { kind: "weight"; item: WeightEntry }
  | { kind: "effect"; item: EffectEntry }
  | { kind: "measure"; item: MeasurementEntry }
  | { kind: "photo"; item: PhotoEntry }
  | { kind: "win"; item: WinEntry }
  | { kind: "activity"; item: ActivityEntry }
  | { kind: "vitals"; item: VitalsEntry };
