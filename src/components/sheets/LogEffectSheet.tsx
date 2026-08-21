import { useState } from "react";
import type { EffectEntry, Severity } from "../../types";
import { EFFECT_OPTIONS } from "../../lib/effects";
import { uid } from "../../lib/ids";
import { useStore } from "../../store/StoreProvider";
import Sheet from "../Sheet";
import { EntryBadge } from "../entryKinds";
import { DateTimeField, Field, NoteField } from "../form/fields";
import ChipGroup from "../form/ChipGroup";
import SeverityPicker from "../form/SeverityPicker";
import EntrySheetFooter from "../form/EntrySheetFooter";
import type { EntrySheetProps } from "./types";

export default function LogEffectSheet({ onClose, onDone, existing }: EntrySheetProps & { existing?: EffectEntry }) {
  const { dispatch } = useStore();
  const [effects, setEffects] = useState<string[]>(existing?.effects ?? []);
  const [severity, setSeverity] = useState<Severity>(existing?.severity ?? 1);
  const [ts, setTs] = useState(existing?.ts ?? Date.now());
  const [note, setNote] = useState(existing?.note ?? "");

  const toggleEffect = (key: string) =>
    setEffects((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));

  const finish = (message: string, undo?: () => void) => {
    onDone(message, undo);
    onClose();
  };

  const save = () => {
    if (effects.length === 0) return;
    const entry: EffectEntry = { id: existing?.id ?? uid(), ts, effects, severity, note: note.trim() || undefined };
    dispatch({ type: "upsert", collection: "effects", item: entry });
    finish(existing ? "Entry updated" : "Noted — hope you feel better soon 💛");
  };

  const remove = () => {
    if (!existing) return;
    dispatch({ type: "remove", collection: "effects", id: existing.id });
    finish("Entry deleted", () => dispatch({ type: "upsert", collection: "effects", item: existing }));
  };

  return (
    <Sheet
      title={existing ? "Edit entry" : "How are you feeling?"}
      icon={<EntryBadge kind="effect" />}
      onClose={onClose}
    >
      <Field label="Symptoms">
        <ChipGroup
          options={EFFECT_OPTIONS.map((e) => ({ key: e, label: e }))}
          selected={effects}
          onToggle={toggleEffect}
        />
      </Field>
      <Field label="How intense?">
        <SeverityPicker value={severity} onChange={setSeverity} />
      </Field>
      <DateTimeField value={ts} onChange={setTs} />
      <NoteField value={note} onChange={setNote} />
      <EntrySheetFooter
        saveLabel={existing ? "Save changes" : "Log how I feel"}
        onSave={save}
        disabled={effects.length === 0}
        onDelete={existing ? remove : undefined}
      />
    </Sheet>
  );
}
