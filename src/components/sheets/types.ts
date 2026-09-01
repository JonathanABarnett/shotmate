import type { ActivityEntry, EffectEntry, MeasurementEntry, PhotoEntry, Shot, VitalsEntry, WeightEntry, WinEntry } from "../../types";

export interface EntrySheetProps {
  onClose: () => void;
  /** report a success message for the toast; pass an undo to offer one-tap restore */
  onDone: (message: string, undo?: () => void) => void;
}

export type ActiveSheet =
  | null
  | { kind: "menu" }
  | { kind: "shot"; existing?: Shot }
  | { kind: "weight"; existing?: WeightEntry }
  | { kind: "calories" }
  | { kind: "effect"; existing?: EffectEntry }
  | { kind: "measure"; existing?: MeasurementEntry }
  | { kind: "photo"; existing?: PhotoEntry }
  | { kind: "win"; existing?: WinEntry }
  | { kind: "activity"; existing?: ActivityEntry }
  | { kind: "vitals"; existing?: VitalsEntry };
