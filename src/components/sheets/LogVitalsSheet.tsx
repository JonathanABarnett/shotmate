import { useState } from "react";
import type { VitalKey, VitalsEntry } from "../../types";
import { fmtVital, latestVitalValues, VITALS } from "../../lib/vitals";
import { uid } from "../../lib/ids";
import { useStore } from "../../store/StoreProvider";
import Sheet from "../Sheet";
import { EntryBadge } from "../entryKinds";
import { DateTimeField, Field, NoteField } from "../form/fields";
import OptionalNumberField from "../form/OptionalNumberField";
import EntrySheetFooter from "../form/EntrySheetFooter";
import type { EntrySheetProps } from "./types";

type Values = VitalsEntry["values"];

export default function LogVitalsSheet({ onClose, onDone, existing }: EntrySheetProps & { existing?: VitalsEntry }) {
  const { data, dispatch } = useStore();
  const previous = latestVitalValues(data.vitals.filter((v) => v.id !== existing?.id));
  const [values, setValues] = useState<Values>(existing?.values ?? {});
  const [ts, setTs] = useState(existing?.ts ?? Date.now());
  const [note, setNote] = useState(existing?.note ?? "");

  const setValue = (key: VitalKey, v: number | undefined) =>
    setValues((prev) => {
      const next = { ...prev };
      if (v == null) delete next[key];
      else next[key] = v;
      return next;
    });
  const hasAny = Object.keys(values).length > 0;

  const finish = (message: string, undo?: () => void) => {
    onDone(message, undo);
    onClose();
  };

  const save = () => {
    if (!hasAny) return;
    const entry: VitalsEntry = { id: existing?.id ?? uid(), ts, values, note: note.trim() || undefined };
    dispatch({ type: "upsert", collection: "vitals", item: entry });
    finish(existing ? "Entry updated" : "Labs & vitals saved 🩺");
  };

  const remove = () => {
    if (!existing) return;
    dispatch({ type: "remove", collection: "vitals", id: existing.id });
    finish("Entry deleted", () => dispatch({ type: "upsert", collection: "vitals", item: existing }));
  };

  const group = (which: "vitals" | "labs") => (
    <div className="measure-grid">
      {VITALS.filter((v) => v.group === which).map((v) => (
        <OptionalNumberField
          key={v.key}
          label={v.label}
          suffix={v.unit}
          placeholder={previous[v.key] != null ? fmtVital(v.key, previous[v.key]!).replace(/[^\d.]/g, "") : "—"}
          value={values[v.key]}
          onChange={(n) => setValue(v.key, n)}
          max={v.max}
        />
      ))}
    </div>
  );

  return (
    <Sheet title={existing ? "Edit labs & vitals" : "Labs & vitals"} icon={<EntryBadge kind="vitals" />} onClose={onClose}>
      <Field label="Vitals" hint="Whatever you have today — a home cuff and a watch are plenty.">
        {group("vitals")}
      </Field>
      <Field label="Labs" hint="From your provider's results — these land in your printable report.">
        {group("labs")}
      </Field>
      <DateTimeField value={ts} onChange={setTs} />
      <NoteField value={note} onChange={setNote} />
      <EntrySheetFooter
        saveLabel={existing ? "Save changes" : "Save labs & vitals"}
        onSave={save}
        disabled={!hasAny}
        onDelete={existing ? remove : undefined}
      />
    </Sheet>
  );
}
