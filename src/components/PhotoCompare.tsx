import { useState } from "react";
import { X } from "lucide-react";
import type { PhotoEntry } from "../types";
import { fmtDayFull } from "../lib/dates";
import PhotoThumb from "./PhotoThumb";

interface PaneProps {
  photos: PhotoEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
  label: string;
}

function ComparePane({ photos, selectedId, onSelect, label }: PaneProps) {
  const photo = photos.find((p) => p.id === selectedId) ?? photos[0];
  return (
    <div className="compare-pane">
      <PhotoThumb photoId={photo.id} alt={`${label} photo`} className="compare-img" />
      <select className="input compare-select" value={photo.id} onChange={(e) => onSelect(e.target.value)} aria-label={label}>
        {photos.map((p) => (
          <option key={p.id} value={p.id}>
            {fmtDayFull(p.ts)}
          </option>
        ))}
      </select>
      {photo.note && <div className="compare-note">{photo.note}</div>}
    </div>
  );
}

interface Props {
  photos: PhotoEntry[];
  initialId?: string;
  onClose: () => void;
}

/** Full-screen before/after viewer — oldest vs. the tapped/newest photo. */
export default function PhotoCompare({ photos, initialId, onClose }: Props) {
  const sorted = [...photos].sort((a, b) => a.ts - b.ts);
  const [beforeId, setBeforeId] = useState(sorted[0].id);
  const [afterId, setAfterId] = useState(initialId ?? sorted[sorted.length - 1].id);
  const single = sorted.length < 2;

  return (
    <div className="compare-overlay" role="dialog" aria-modal="true">
      <div className="compare-top">
        <div className="sheet-title">{single ? "Progress photo" : "Before & after"}</div>
        <button className="icon-btn icon-btn-sm" onClick={onClose} aria-label="Close">
          <X size={19} />
        </button>
      </div>
      <div className={`compare-grid${single ? " single" : ""}`}>
        {!single && <ComparePane photos={sorted} selectedId={beforeId} onSelect={setBeforeId} label="Before" />}
        <ComparePane photos={sorted} selectedId={afterId} onSelect={setAfterId} label={single ? "Photo" : "After"} />
      </div>
    </div>
  );
}
