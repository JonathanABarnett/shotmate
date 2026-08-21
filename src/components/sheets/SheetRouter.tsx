import type { EntryKind } from "../entryKinds";
import LogMenuSheet from "./LogMenuSheet";
import LogShotSheet from "./LogShotSheet";
import LogWeightSheet from "./LogWeightSheet";
import LogEffectSheet from "./LogEffectSheet";
import LogMeasureSheet from "./LogMeasureSheet";
import type { ActiveSheet } from "./types";

interface Props {
  sheet: ActiveSheet;
  onClose: () => void;
  onOpen: (kind: EntryKind) => void;
  onDone: (message: string) => void;
}

/** Renders whichever sheet is active — keeps App free of sheet wiring. */
export default function SheetRouter({ sheet, onClose, onOpen, onDone }: Props) {
  if (!sheet) return null;
  switch (sheet.kind) {
    case "menu":
      return <LogMenuSheet onClose={onClose} onPick={onOpen} />;
    case "shot":
      return <LogShotSheet onClose={onClose} onDone={onDone} existing={sheet.existing} />;
    case "weight":
      return <LogWeightSheet onClose={onClose} onDone={onDone} existing={sheet.existing} />;
    case "effect":
      return <LogEffectSheet onClose={onClose} onDone={onDone} existing={sheet.existing} />;
    case "measure":
      return <LogMeasureSheet onClose={onClose} onDone={onDone} existing={sheet.existing} />;
  }
}
