import { useEffect, useRef, useState } from "react";
import { Camera, Images } from "lucide-react";
import type { PhotoEntry, PhotoFocus } from "../../types";
import { HOUR } from "../../lib/dates";
import { uid } from "../../lib/ids";
import { useStore } from "../../store/StoreProvider";
import { preparePhotoBlob, savePhotoBlob } from "../../store/photoStore";
import { usePhotoUrl } from "../../hooks/usePhotoUrl";
import Sheet from "../Sheet";
import { EntryBadge } from "../entryKinds";
import { DateTimeField, Field, NoteField } from "../form/fields";
import EntrySheetFooter from "../form/EntrySheetFooter";
import PhotoCropFrame from "../PhotoCropFrame";
import PhotoThumb from "../PhotoThumb";
import type { EntrySheetProps } from "./types";

const CENTER: PhotoFocus = { x: 0.5, y: 0.5 };

export default function LogPhotoSheet({ onClose, onDone, existing }: EntrySheetProps & { existing?: PhotoEntry }) {
  const { data, dispatch } = useStore();
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Blob | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string>();
  const existingUrl = usePhotoUrl(existing?.id);
  const [ts, setTs] = useState(existing?.ts ?? Date.now());
  const [note, setNote] = useState(existing?.note ?? "");
  const [focus, setFocus] = useState<PhotoFocus>(existing?.focus ?? CENTER);
  const [zoom, setZoom] = useState(existing?.zoom ?? 1);
  const lastPhoto = [...data.photos].filter((p) => p.id !== existing?.id).sort((a, b) => b.ts - a.ts)[0];

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
    // a gallery pick of an older photo dates the entry when it was taken — still editable below
    if (!existing && Date.now() - file.lastModified > HOUR) setTs(file.lastModified);
  };

  const previewUrl = pendingUrl ?? existingUrl;

  const finish = (message: string, undo?: () => void) => {
    onDone(message, undo);
    onClose();
  };

  const save = async () => {
    if (!existing && !pending) return;
    const entry: PhotoEntry = {
      id: existing?.id ?? uid(),
      ts,
      note: note.trim() || undefined,
      focus,
      zoom: zoom > 1 ? Math.round(zoom * 100) / 100 : undefined,
    };
    if (pending) await savePhotoBlob(entry.id, pending);
    dispatch({ type: "upsert", collection: "photos", item: entry });
    finish(existing ? "Photo updated" : "Photo saved 📸 — see them all under Trends → Body");
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
          <PhotoCropFrame
            url={previewUrl}
            focus={focus}
            zoom={zoom}
            onChange={setFocus}
            onZoomChange={setZoom}
            onReplace={() => galleryRef.current?.click()}
          />
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
        {lastPhoto && !existing && (
          <div className="photo-ref">
            <PhotoThumb photoId={lastPhoto.id} alt="Previous photo" className="photo-ref-img" focus={lastPhoto.focus} zoom={lastPhoto.zoom} />
            <span>
              Match your last one — same spot, same distance, same angle. Zoom &amp; drag the crop afterward until the two line up.
            </span>
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
