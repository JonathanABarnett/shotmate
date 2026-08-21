import { useEffect, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import type { PhotoEntry } from "../../types";
import { uid } from "../../lib/ids";
import { useStore } from "../../store/StoreProvider";
import { preparePhotoBlob, savePhotoBlob } from "../../store/photoStore";
import { usePhotoUrl } from "../../hooks/usePhotoUrl";
import Sheet from "../Sheet";
import { EntryBadge } from "../entryKinds";
import { DateTimeField, Field, NoteField } from "../form/fields";
import EntrySheetFooter from "../form/EntrySheetFooter";
import type { EntrySheetProps } from "./types";

export default function LogPhotoSheet({ onClose, onDone, existing }: EntrySheetProps & { existing?: PhotoEntry }) {
  const { dispatch } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Blob | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string>();
  const existingUrl = usePhotoUrl(existing?.id);
  const [ts, setTs] = useState(existing?.ts ?? Date.now());
  const [note, setNote] = useState(existing?.note ?? "");

  useEffect(() => () => {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
  }, [pendingUrl]);

  const handlePick = async (file: File | undefined) => {
    if (!file) return;
    const blob = await preparePhotoBlob(file);
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPending(blob);
    setPendingUrl(URL.createObjectURL(blob));
  };

  const previewUrl = pendingUrl ?? existingUrl;

  const finish = (message: string, undo?: () => void) => {
    onDone(message, undo);
    onClose();
  };

  const save = async () => {
    if (!existing && !pending) return;
    const entry: PhotoEntry = { id: existing?.id ?? uid(), ts, note: note.trim() || undefined };
    if (pending) await savePhotoBlob(entry.id, pending);
    dispatch({ type: "upsert", collection: "photos", item: entry });
    finish(existing ? "Photo updated" : "Photo saved 📸");
  };

  const remove = () => {
    if (!existing) return;
    dispatch({ type: "remove", collection: "photos", id: existing.id });
    finish("Photo deleted", () => dispatch({ type: "upsert", collection: "photos", item: existing }));
  };

  return (
    <Sheet title={existing ? "Edit photo" : "Progress photo"} icon={<EntryBadge kind="photo" />} onClose={onClose}>
      <Field label="Photo" hint="Stays on this device — same pose, same spot, same lighting works best.">
        {previewUrl ? (
          <button className="photo-preview" onClick={() => fileRef.current?.click()}>
            <img src={previewUrl} alt="Progress" />
            <span className="photo-preview-hint">Tap to replace</span>
          </button>
        ) : (
          <button className="photo-pick" onClick={() => fileRef.current?.click()}>
            <ImagePlus size={26} />
            Take or choose a photo
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handlePick(e.target.files?.[0])}
        />
      </Field>
      <DateTimeField value={ts} onChange={setTs} />
      <NoteField value={note} onChange={setNote} />
      <EntrySheetFooter
        saveLabel={existing ? "Save changes" : "Save photo"}
        onSave={save}
        disabled={!existing && !pending}
        onDelete={existing ? remove : undefined}
      />
    </Sheet>
  );
}
