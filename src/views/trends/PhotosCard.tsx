import { useState } from "react";
import { Camera } from "lucide-react";
import type { AppData } from "../../types";
import { fmtDay } from "../../lib/dates";
import PhotoThumb from "../../components/PhotoThumb";
import PhotoCompare from "../../components/PhotoCompare";
import EmptyState from "../../components/EmptyState";

interface Props {
  data: AppData;
  onAddPhoto: () => void;
}

export default function PhotosCard({ data, onAddPhoto }: Props) {
  const photos = [...data.photos].sort((a, b) => b.ts - a.ts);
  const [viewerId, setViewerId] = useState<string | null>(null);

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Progress photos</h3>
          <div className="card-sub">Private — stored only on this device</div>
        </div>
        {photos.length > 0 && (
          <button className="link-btn" onClick={onAddPhoto}>
            <Camera size={15} /> Add
          </button>
        )}
      </div>
      {photos.length === 0 ? (
        <EmptyState
          emoji="📸"
          title="Your future before & after"
          sub="Take one today — same pose, same spot. You'll be glad you did."
          action={
            <button className="btn btn-subtle btn-sm" onClick={onAddPhoto}>
              <Camera size={16} /> Add first photo
            </button>
          }
        />
      ) : (
        <div className="photo-strip">
          {photos.map((p) => (
            <button key={p.id} className="photo-cell" onClick={() => setViewerId(p.id)}>
              <PhotoThumb photoId={p.id} alt={`Photo from ${fmtDay(p.ts)}`} className="photo-cell-img" focus={p.focus} zoom={p.zoom} />
              <span className="photo-cell-date">{fmtDay(p.ts)}</span>
            </button>
          ))}
        </div>
      )}
      {viewerId && (
        <PhotoCompare data={data} photos={data.photos} initialId={viewerId} onClose={() => setViewerId(null)} />
      )}
      {photos.length > 0 && (
        <p className="field-hint">Tap a photo to compare before &amp; after — edit or delete from History.</p>
      )}
    </section>
  );
}
