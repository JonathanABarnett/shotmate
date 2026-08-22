import { useState } from "react";
import type { EffectEntry, Severity } from "../../types";
import { EFFECT_OPTIONS, FEELING_FINE } from "../../lib/effects";
import { uid } from "../../lib/ids";
import { useStore } from "../../store/StoreProvider";
import Sheet from "../Sheet";
import { EntryBadge } from "../entryKinds";
import { DateTimeField, Field, NoteField } from "../form/fields";
import ChipGroup from "../form/ChipGroup";
import SeverityPicker from "../form/SeverityPicker";
import EntrySheetFooter from "../form/EntrySheetFooter";
import type { EntrySheetProps } from "./types";

/** "Feeling fine" stands alone: picking it clears the symptoms, and picking a symptom clears it. */
function toggleTag(selected: string[], key: string): string[] {
  if (key === FEELING_FINE) return selected.includes(key) ? [] : [FEELING_FINE];
  const rest = selected.filter((x) => x !== FEELING_FINE);
  return rest.includes(key) ? rest.filter((x) => x !== key) : [...rest, key];
}

const savedMessage = (editing: boolean, fine: boolean) =>
  editing ? "Entry updated" : fine ? "Logged — here's to more days like this 💛" : "Noted — hope you feel better soon 💛";

export default function LogEffectSheet({ onClose, onDone, existing }: EntrySheetProps & { existing?: EffectEntry }) {
  const { dispatch } = useStore();
  const [effects, setEffects] = useState<string[]>(existing?.effects ?? []);
  const [severity, setSeverity] = useState<Severity>(existing?.severity ?? 1);
  const [ts, setTs] = useState(existing?.ts ?? Date.now());
  const [note, setNote] = useState(existing?.note ?? "");
  const fine = effects.includes(FEELING_FINE);

  const toggleEffect = (key: string) => setEffects((prev) => toggleTag(prev, key));

  const finish = (message: string, undo?: () => void) => {
    onDone(message, undo);
    onClose();
  };

  const save = () => {
    if (effects.length === 0) return;
    const entry: EffectEntry = {
      id: existing?.id ?? uid(),
      ts,
      effects,
      severity: fine ? 1 : severity,
      note: note.trim() || undefined,
    };
    dispatch({ type: "upsert", collection: "effects", item: entry });
    finish(savedMessage(Boolean(existing), fine));
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
      <Field label="Symptoms" hint="Tap everything that applies. Log as often as you like — several times a day is fine.">
        <button
          className={`chip chip-fine${fine ? " active" : ""}`}
          aria-pressed={fine}
          onClick={() => toggleEffect(FEELING_FINE)}
        >
          😊 Feeling fine — no symptoms
        </button>
        <div className="spacer-8" />
        <ChipGroup
          options={EFFECT_OPTIONS.map((e) => ({ key: e, label: e }))}
          selected={effects}
          onToggle={toggleEffect}
        />
      </Field>
      {!fine && (
        <Field label="How intense?">
          <SeverityPicker value={severity} onChange={setSeverity} />
        </Field>
      )}
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
