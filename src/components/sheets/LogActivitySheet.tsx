import { useState } from "react";
import type { ActivityEntry, ActivityType } from "../../types";
import { ACTIVITY_TYPES, distanceUnit, KM_PER_MI } from "../../lib/activity";
import { uid } from "../../lib/ids";
import { useStore } from "../../store/StoreProvider";
import Sheet from "../Sheet";
import { EntryBadge } from "../entryKinds";
import { DateTimeField, Field, NoteField } from "../form/fields";
import ChipGroup from "../form/ChipGroup";
import Stepper from "../form/Stepper";
import OptionalNumberField from "../form/OptionalNumberField";
import EntrySheetFooter from "../form/EntrySheetFooter";
import type { EntrySheetProps } from "./types";

export default function LogActivitySheet({ onClose, onDone, existing }: EntrySheetProps & { existing?: ActivityEntry }) {
  const { data, dispatch } = useStore();
  const unit = data.settings.unit;
  const du = distanceUnit(unit);

  const [type, setType] = useState<ActivityType>(existing?.type ?? "walk");
  const [minutes, setMinutes] = useState(existing?.minutes ?? 30);
  const [distanceMi, setDistanceMi] = useState<number | undefined>(existing?.distanceMi);
  const [ts, setTs] = useState(existing?.ts ?? Date.now());
  const [note, setNote] = useState(existing?.note ?? "");

  const finish = (message: string, undo?: () => void) => {
    onDone(message, undo);
    onClose();
  };

  const save = () => {
    const entry: ActivityEntry = {
      id: existing?.id ?? uid(),
      ts,
      type,
      minutes,
      distanceMi,
      note: note.trim() || undefined,
      imported: existing?.imported,
    };
    dispatch({ type: "upsert", collection: "activities", item: entry });
    finish(existing ? "Activity updated" : "Nice moving! 🏃");
  };

  const remove = () => {
    if (!existing) return;
    dispatch({ type: "remove", collection: "activities", id: existing.id });
    finish("Entry deleted", () => dispatch({ type: "upsert", collection: "activities", item: existing }));
  };

  return (
    <Sheet title={existing ? "Edit activity" : "Log activity"} icon={<EntryBadge kind="activity" />} onClose={onClose}>
      <Field label="What did you do?">
        <ChipGroup
          options={ACTIVITY_TYPES.map((t) => ({ key: t.key, label: `${t.emoji} ${t.label}` }))}
          selected={[type]}
          onToggle={(key) => setType(key as ActivityType)}
        />
      </Field>
      <Field label="How long?">
        <Stepper value={minutes} onChange={setMinutes} step={5} min={5} max={600} unit="min" />
      </Field>
      <OptionalNumberField
        label="Distance (optional)"
        suffix={du}
        placeholder="—"
        value={distanceMi != null ? Math.round((unit === "lbs" ? distanceMi : distanceMi * KM_PER_MI) * 10) / 10 : undefined}
        onChange={(v) => setDistanceMi(v != null ? Math.round((unit === "lbs" ? v : v / KM_PER_MI) * 100) / 100 : undefined)}
        max={300}
      />
      <DateTimeField value={ts} onChange={setTs} />
      <NoteField value={note} onChange={setNote} />
      <EntrySheetFooter
        saveLabel={existing ? "Save changes" : "Log activity"}
        onSave={save}
        onDelete={existing ? remove : undefined}
      />
    </Sheet>
  );
}
