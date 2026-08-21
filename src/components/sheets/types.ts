import type { EffectEntry, Shot, WeightEntry } from "../../types";

export interface EntrySheetProps {
  onClose: () => void;
  /** report a success message for the toast */
  onDone: (message: string) => void;
}

export type ActiveSheet =
  | null
  | { kind: "menu" }
  | { kind: "shot"; existing?: Shot }
  | { kind: "weight"; existing?: WeightEntry }
  | { kind: "effect"; existing?: EffectEntry };
