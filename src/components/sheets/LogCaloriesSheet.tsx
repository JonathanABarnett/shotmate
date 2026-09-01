import { useState } from "react";
import { calorieBudget, todayIntake } from "../../lib/intake";
import { calorieReply } from "../../lib/logReplies";
import { useStore } from "../../store/StoreProvider";
import Sheet from "../Sheet";
import { EntryBadge } from "../entryKinds";
import { Field } from "../form/fields";
import EntrySheetFooter from "../form/EntrySheetFooter";
import type { EntrySheetProps } from "./types";

const MAX_KCAL = 6000;

/** The whole day's calories as one typed number — no per-food diary. */
export default function LogCaloriesSheet({ onClose, onDone }: EntrySheetProps) {
  const { data, dispatch } = useStore();
  const current = todayIntake(data)?.kcal ?? 0;
  const [draft, setDraft] = useState(current > 0 ? String(current) : "");
  const budget = calorieBudget(data);
  const parsed = Math.round(Number(draft));
  const valid = draft.trim() !== "" && Number.isFinite(parsed) && parsed >= 0 && parsed <= MAX_KCAL;

  const save = () => {
    if (!valid) return;
    dispatch({ type: "addIntake", ts: Date.now(), kcal: parsed - current });
    onDone(parsed > 0 ? calorieReply(data) : "Calories cleared");
    onClose();
  };

  return (
    <Sheet title="Today's calories" icon={<EntryBadge kind="calories" />} onClose={onClose}>
      <Field
        label="Day's total"
        hint={
          budget
            ? `Your budget is ${budget} kcal — grab the day's total from Lose It.`
            : "Grab the day's total from Lose It (or wherever you count)."
        }
      >
        <input
          className="input"
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_KCAL}
          placeholder="e.g. 1650"
          aria-label="Calories today"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && valid && save()}
          autoFocus
        />
      </Field>
      <EntrySheetFooter saveLabel="Save" onSave={save} disabled={!valid} />
    </Sheet>
  );
}
