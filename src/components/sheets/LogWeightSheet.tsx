import { useState } from "react";
import type { WeightEntry } from "../../types";
import { fromDisplayWeight, latestWeight, toDisplayWeight } from "../../lib/weight";
import { uid } from "../../lib/ids";
import { useStore } from "../../store/StoreProvider";
import Sheet from "../Sheet";
import { EntryBadge } from "../entryKinds";
import { DateTimeField, Field, NoteField } from "../form/fields";
import WeightInput, { parseWeightInput } from "../form/WeightInput";
import EntrySheetFooter from "../form/EntrySheetFooter";
import type { EntrySheetProps } from "./types";

const displayString = (lbs: number, unit: "lbs" | "kg") => String(Math.round(toDisplayWeight(lbs, unit) * 10) / 10);

export default function LogWeightSheet({ onClose, onDone, existing }: EntrySheetProps & { existing?: WeightEntry }) {
  const { data, dispatch } = useStore();
  const unit = data.settings.unit;

  const initialLbs = existing?.lbs ?? latestWeight(data.weights)?.lbs;
  const [value, setValue] = useState(initialLbs != null ? displayString(initialLbs, unit) : "");
  const [ts, setTs] = useState(existing?.ts ?? Date.now());
  const [note, setNote] = useState(existing?.note ?? "");

  const parsed = parseWeightInput(value);

  const finish = (message: string, undo?: () => void) => {
    onDone(message, undo);
    onClose();
  };

  const save = () => {
    if (parsed == null) return;
    const entry: WeightEntry = {
      id: existing?.id ?? uid(),
      ts,
      lbs: Math.round(fromDisplayWeight(parsed, unit) * 100) / 100,
      note: note.trim() || undefined,
    };
    dispatch({ type: "upsert", collection: "weights", item: entry });
    finish(existing ? "Weight updated" : "Weight logged ⚖️");
  };

  const remove = () => {
    if (!existing) return;
    dispatch({ type: "remove", collection: "weights", id: existing.id });
    finish("Entry deleted", () => dispatch({ type: "upsert", collection: "weights", item: existing }));
  };

  return (
    <Sheet title={existing ? "Edit weight" : "Log weight"} icon={<EntryBadge kind="weight" />} onClose={onClose}>
      <Field label="Today you weigh">
        <WeightInput value={value} onChange={setValue} unit={unit} autoFocus={!existing} />
      </Field>
      <DateTimeField value={ts} onChange={setTs} />
      <NoteField value={note} onChange={setNote} />
      <EntrySheetFooter
        saveLabel={existing ? "Save changes" : "Log weight"}
        onSave={save}
        disabled={parsed == null}
        onDelete={existing ? remove : undefined}
      />
    </Sheet>
  );
}
