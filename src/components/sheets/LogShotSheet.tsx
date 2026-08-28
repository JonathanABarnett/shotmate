import { useState } from "react";
import type { Shot } from "../../types";
import { medFor } from "../../lib/meds";
import { drawVolume, fmtDraw } from "../../lib/draw";
import { suggestedSite } from "../../lib/sites";
import { uid } from "../../lib/ids";
import { useStore } from "../../store/StoreProvider";
import Sheet from "../Sheet";
import BodyMap from "../BodyMap";
import { EntryBadge } from "../entryKinds";
import { DateTimeField, Field, NoteField } from "../form/fields";
import DosePicker from "../form/DosePicker";
import EntrySheetFooter from "../form/EntrySheetFooter";
import { shotReply } from "../../lib/logReplies";
import type { EntrySheetProps } from "./types";

export default function LogShotSheet({ onClose, onDone, existing }: EntrySheetProps & { existing?: Shot }) {
  const { data, dispatch } = useStore();
  const med = medFor(data.settings);
  const otherShots = data.shots.filter((s) => s.id !== existing?.id);

  const [doseMg, setDoseMg] = useState(existing?.doseMg ?? data.settings.plannedDoseMg ?? med.doses[0]);
  const [site, setSite] = useState(existing?.site ?? suggestedSite(otherShots));
  const [ts, setTs] = useState(existing?.ts ?? Date.now());
  const [note, setNote] = useState(existing?.note ?? "");

  const finish = (message: string, undo?: () => void) => {
    onDone(message, undo);
    onClose();
  };

  const save = () => {
    const shot: Shot = { id: existing?.id ?? uid(), ts, doseMg, site, note: note.trim() || undefined };
    dispatch({ type: "upsert", collection: "shots", item: shot });
    if (!existing && doseMg !== data.settings.plannedDoseMg) {
      dispatch({ type: "updateSettings", patch: { plannedDoseMg: doseMg } });
    }
    finish(existing ? "Shot updated" : shotReply(data, shot));
  };

  const remove = () => {
    if (!existing) return;
    dispatch({ type: "remove", collection: "shots", id: existing.id });
    finish("Shot deleted", () => dispatch({ type: "upsert", collection: "shots", item: existing }));
  };

  const draw = data.settings.vialMgPerMl != null ? drawVolume(doseMg, data.settings.vialMgPerMl) : undefined;

  return (
    <Sheet title={existing ? "Edit shot" : "Log a shot"} icon={<EntryBadge kind="shot" />} onClose={onClose}>
      <Field label={`Dose · ${med.brand}`} hint={draw ? `Draw ≈ ${fmtDraw(draw)}` : undefined}>
        <DosePicker med={med} value={doseMg} onChange={setDoseMg} />
      </Field>
      <Field
        label="Injection site"
        hint={data.settings.siteMapMirror ? "Shown as you look down at yourself — your left is on the left." : "Shown facing you — your left is on the right (switch in Settings → Appearance)."}
      >
        <BodyMap shots={otherShots} selected={site} onSelect={setSite} bodyType={data.settings.bodyType} mirror={data.settings.siteMapMirror} />
      </Field>
      <DateTimeField value={ts} onChange={setTs} />
      <NoteField value={note} onChange={setNote} />
      <EntrySheetFooter
        saveLabel={existing ? "Save changes" : "Log shot"}
        onSave={save}
        onDelete={existing ? remove : undefined}
      />
    </Sheet>
  );
}
