import { useEffect, useRef, useState } from "react";
import { Camera, Images } from "lucide-react";
import type { PhotoEntry, PhotoFocus } from "../../types";
import { uid } from "../../lib/ids";
import { useStore } from "../../store/StoreProvider";
import { preparePhotoBlob, savePhotoBlob } from "../../store/photoStore";
import { usePhotoUrl } from "../../hooks/usePhotoUrl";
import Sheet from "../Sheet";
import { EntryBadge } from "../entryKinds";
import { DateTimeField, Field, NoteField } from "../form/fields";
import EntrySheetFooter from "../form/EntrySheetFooter";
import PhotoCropFrame from "../PhotoCropFrame";
import type { EntrySheetProps } from "./types";

const CENTER: PhotoFocus = { x: 0.5, y: 0.5 };

export default function LogPhotoSheet({ onClose, onDone, existing }: EntrySheetProps & { existing?: PhotoEntry }) {
  const { dispatch } = useStore();
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Blob | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string>();
  const existingUrl = usePhotoUrl(existing?.id);
  const [ts, setTs] = useState(existing?.ts ?? Date.now());
  const [note, setNote] = useState(existing?.note ?? "");
  const [focus, setFocus] = useState<PhotoFocus>(existing?.focus ?? CENTER);

  useEffect(() => () => {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
  }, [pendingUrl]);

  const handlePick = async (file: File | undefined) => {
    if (!file) return;
    const blob = await preparePhotoBlob(file);
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPending(blob);
    setPendingUrl(URL.createObjectURL(blob));
    setFocus(CENTER);
  };

  const previewUrl = pendingUrl ?? existingUrl;

  const finish = (message: string, undo?: () => void) => {
    onDone(message, undo);
    onClose();
  };

  const save = async () => {
    if (!existing && !pending) return;
    const entry: PhotoEntry = { id: existing?.id ?? uid(), ts, note: note.trim() || undefined, focus };
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
      <Field
        label="Photo"
        hint={previewUrl ? "Drag the photo to choose what the crop shows — thumbnails, before/after, and share cards use it. Stays on this device." : "Stays on this device — same pose, same spot, same lighting works best."}
      >
        {previewUrl ? (
          <PhotoCropFrame url={previewUrl} focus={focus} onChange={setFocus} onReplace={() => galleryRef.current?.click()} />
        ) : (
          <div className="photo-pick-row">
            <button className="photo-pick" onClick={() => cameraRef.current?.click()}>
              <Camera size={26} />
              Take a photo
            </button>
            <button className="photo-pick" onClick={() => galleryRef.current?.click()}>
              <Images size={26} />
              Choose from gallery
            </button>
          </div>
        )}
        {/* Two pickers: one opens the camera directly, one the gallery/files. */}
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handlePick(e.target.files?.[0])} />
        <input ref={galleryRef} type="file" accept="image/*" hidden onChange={(e) => handlePick(e.target.files?.[0])} />
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
