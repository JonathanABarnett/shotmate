import { useState } from "react";
import type { MeasureKey, MeasurementEntry } from "../../types";
import { fmtLength, fromDisplayLength, latestValues, lengthUnit, MEASURES, toDisplayLength } from "../../lib/measures";
import { uid } from "../../lib/ids";
import { useStore } from "../../store/StoreProvider";
import Sheet from "../Sheet";
import { EntryBadge } from "../entryKinds";
import { DateTimeField, Field, NoteField } from "../form/fields";
import OptionalNumberField from "../form/OptionalNumberField";
import EntrySheetFooter from "../form/EntrySheetFooter";
import type { EntrySheetProps } from "./types";

type Values = Partial<Record<MeasureKey, number>>;

export default function LogMeasureSheet({ onClose, onDone, existing }: EntrySheetProps & { existing?: MeasurementEntry }) {
  const { data, dispatch } = useStore();
  const unit = data.settings.unit;
  const lu = lengthUnit(unit);
  const previous = latestValues(data.measures.filter((m) => m.id !== existing?.id));

  const [valuesIn, setValuesIn] = useState<Values>(existing?.valuesIn ?? {});
  const [ts, setTs] = useState(existing?.ts ?? Date.now());
  const [note, setNote] = useState(existing?.note ?? "");

  const setMeasure = (key: MeasureKey, display: number | undefined) =>
    setValuesIn((prev) => {
      const next = { ...prev };
      if (display == null) delete next[key];
      else next[key] = Math.round(fromDisplayLength(display, unit) * 100) / 100;
      return next;
    });

  const hasAny = Object.keys(valuesIn).length > 0;

  const finish = (message: string, undo?: () => void) => {
    onDone(message, undo);
    onClose();
  };

  const save = () => {
    if (!hasAny) return;
    const entry: MeasurementEntry = { id: existing?.id ?? uid(), ts, valuesIn, note: note.trim() || undefined };
    dispatch({ type: "upsert", collection: "measures", item: entry });
    finish(existing ? "Measurements updated" : "Measurements logged 📏");
  };

  const remove = () => {
    if (!existing) return;
    dispatch({ type: "remove", collection: "measures", id: existing.id });
    finish("Entry deleted", () => dispatch({ type: "upsert", collection: "measures", item: existing }));
  };

  return (
    <Sheet title={existing ? "Edit measurements" : "Measure up"} icon={<EntryBadge kind="measure" />} onClose={onClose}>
      <Field label="Tape measure" hint="Fill in whichever you measured — relaxed tape, same spots each time. Waist = narrowest point; stomach = around the navel.">
        <div className="measure-grid">
          {MEASURES.map(({ key, label }) => (
            <OptionalNumberField
              key={key}
              label={label}
              suffix={lu}
              placeholder={previous[key] != null ? fmtLength(previous[key]!, unit) : "—"}
              value={valuesIn[key] != null ? Math.round(toDisplayLength(valuesIn[key]!, unit) * 10) / 10 : undefined}
              onChange={(v) => setMeasure(key, v)}
              max={unit === "lbs" ? 120 : 300}
            />
          ))}
        </div>
      </Field>
      <DateTimeField value={ts} onChange={setTs} />
      <NoteField value={note} onChange={setNote} />
      <EntrySheetFooter
        saveLabel={existing ? "Save changes" : "Log measurements"}
        onSave={save}
        disabled={!hasAny}
        onDelete={existing ? remove : undefined}
      />
    </Sheet>
  );
}
