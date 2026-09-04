import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Share2, X } from "lucide-react";
import type { AppData, MeasureKey, PhotoEntry } from "../types";
import { DAY, fmtDay, fmtDayFull } from "../lib/dates";
import { signedLength, signedWeight } from "../lib/format";
import { fmtLength, lengthUnit, nearestMeasureIn } from "../lib/measures";
import { renderShareCard, shareOrDownload, type SharePane } from "../lib/shareCard";
import { fmtWeight, nearestWeightLbs } from "../lib/weight";
import { loadPhotoBlob } from "../store/photoStore";
import PhotoThumb from "./PhotoThumb";

interface PaneProps {
  data: AppData;
  photos: PhotoEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
  onZoom: (id: string) => void;
  label: string;
}

function ComparePane({ data, photos, selectedId, onSelect, onZoom, label }: PaneProps) {
  const photo = photos.find((p) => p.id === selectedId) ?? photos[0];
  const details = detailsFor(data, photo.ts);
  return (
    <div className="compare-pane">
      <button className="compare-imgbtn" onClick={() => onZoom(photo.id)} aria-label={`Enlarge ${label.toLowerCase()} photo`}>
        <PhotoThumb photoId={photo.id} alt={`${label} photo`} className="compare-img" focus={photo.focus} zoom={photo.zoom} />
      </button>
      <select className="input compare-select" value={photo.id} onChange={(e) => onSelect(e.target.value)} aria-label={label}>
        {photos.map((p) => (
          <option key={p.id} value={p.id}>
            {fmtDayFull(p.ts)}
          </option>
        ))}
      </select>
      <div className="compare-stats">
        {details.weight == null && details.tapes.length === 0 ? (
          <div>No weigh-in or tape near this date</div>
        ) : (
          <>
            {details.weight && <div className="stat-main">{details.weight}</div>}
            {details.tapes.map((t) => (
              <div key={t}>{t}</div>
            ))}
          </>
        )}
      </div>
      {photo.note && <div className="compare-note">{photo.note}</div>}
    </div>
  );
}

const DETAIL_TAPES: { key: MeasureKey; label: string }[] = [
  { key: "waist", label: "Waist" },
  { key: "stomach", label: "Stomach" },
  { key: "hips", label: "Hips" },
  { key: "chest", label: "Chest" },
];

/** Weight plus every taped measure recorded near the photo's date. */
function detailsFor(data: AppData, ts: number): { weight?: string; tapes: string[] } {
  const unit = data.settings.unit;
  const lbs = nearestWeightLbs(data.weights, ts);
  const mark = lengthUnit(unit) === "in" ? "″" : " cm";
  const tapes: string[] = [];
  for (const { key, label } of DETAIL_TAPES) {
    const inches = nearestMeasureIn(data.measures, key, ts);
    if (inches != null) tapes.push(`${label} ${fmtLength(inches, unit)}${mark}`);
  }
  return { weight: lbs != null ? fmtWeight(lbs, unit) : undefined, tapes };
}

/** Weight and waist nearest a photo's date, as short stat strings — the share card's compact pair. */
function statsFor(data: AppData, ts: number): { stats: string[]; lbs?: number; waistIn?: number } {
  const unit = data.settings.unit;
  const lbs = nearestWeightLbs(data.weights, ts);
  const waistIn = nearestMeasureIn(data.measures, "waist", ts);
  const stats = [
    ...(lbs != null ? [fmtWeight(lbs, unit)] : []),
    ...(waistIn != null ? [`Waist ${fmtLength(waistIn, unit)} ${lengthUnit(unit)}`] : []),
  ];
  return { stats, lbs, waistIn };
}

function summaryFor(data: AppData, before: PhotoEntry, after: PhotoEntry): string {
  const unit = data.settings.unit;
  const a = statsFor(data, before.ts);
  const b = statsFor(data, after.ts);
  const parts: string[] = [];
  if (a.lbs != null && b.lbs != null) parts.push(signedWeight(b.lbs - a.lbs, unit));
  if (a.waistIn != null && b.waistIn != null) parts.push(`${signedLength(b.waistIn - a.waistIn, unit)} waist`);
  const weeks = Math.round((after.ts - before.ts) / (7 * DAY));
  parts.push(`${weeks} ${weeks === 1 ? "week" : "weeks"}`);
  return parts.join("  ·  ");
}

/** One photo, full screen — its numbers overlaid along the bottom. */
function PhotoZoom({ data, photo, onClose }: { data: AppData; photo: PhotoEntry; onClose: () => void }) {
  const details = detailsFor(data, photo.ts);
  return (
    <div className="photo-zoom" role="dialog" aria-modal="true" onClick={onClose}>
      <button className="icon-btn zoom-close" aria-label="Close enlarged photo" onClick={onClose}>
        <X size={20} />
      </button>
      <PhotoThumb photoId={photo.id} alt={`Photo from ${fmtDayFull(photo.ts)}`} className="zoom-img" />
      <div className="zoom-info">
        <div className="zoom-date">{fmtDayFull(photo.ts)}</div>
        {details.weight && <div className="zoom-weight">{details.weight}</div>}
        {details.tapes.length > 0 && <div className="zoom-tapes">{details.tapes.join("  ·  ")}</div>}
        {photo.note && <div className="zoom-note">{photo.note}</div>}
      </div>
    </div>
  );
}

interface Props {
  data: AppData;
  photos: PhotoEntry[];
  initialId?: string;
  onClose: () => void;
}

/** Full-screen before/after viewer — oldest vs. the tapped/newest photo, with a share card. */
export default function PhotoCompare({ data, photos, initialId, onClose }: Props) {
  const sorted = [...photos].sort((a, b) => a.ts - b.ts);
  const [beforeId, setBeforeId] = useState(sorted[0].id);
  const [afterId, setAfterId] = useState(initialId ?? sorted[sorted.length - 1].id);
  const [status, setStatus] = useState<string>();
  const [zoomId, setZoomId] = useState<string | null>(null);
  const single = sorted.length < 2;

  // portal + scroll lock so the viewer always opens at the top of the SCREEN,
  // no matter how far down the page it was launched from
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") (zoomId ? setZoomId(null) : onClose());
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, zoomId]);

  const share = async () => {
    setStatus("Preparing your card…");
    try {
      const chosen = (single ? [afterId] : [beforeId, afterId]).map((id) => sorted.find((p) => p.id === id)!);
      const panes: SharePane[] = [];
      for (const photo of chosen) {
        const image = await loadPhotoBlob(photo.id);
        if (image) panes.push({ image, caption: fmtDay(photo.ts), stats: statsFor(data, photo.ts).stats, focus: photo.focus, zoom: photo.zoom });
      }
      if (panes.length === 0) throw new Error("no photos");
      const summary = chosen.length === 2 ? summaryFor(data, chosen[0], chosen[1]) : statsFor(data, chosen[0].ts).stats.join("  ·  ") || "My progress";
      const blob = await renderShareCard(panes, summary);
      const outcome = await shareOrDownload(blob, `shotmate-progress-${fmtDay(chosen.at(-1)!.ts).replace(/\W+/g, "-")}.png`);
      setStatus(outcome === "shared" ? "Shared 🎉" : "Saved to your downloads 🎉");
    } catch {
      setStatus("Couldn't build the card — try again");
    }
  };

  return createPortal(
    <div className="compare-overlay" role="dialog" aria-modal="true">
      <div className="compare-top">
        <div className="sheet-title">{single ? "Progress photo" : "Before & after"}</div>
        <div className="compare-actions">
          <button className="btn btn-subtle btn-sm" onClick={share}>
            <Share2 size={15} /> Share card
          </button>
          <button className="icon-btn icon-btn-sm" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>
      </div>
      {status && <p className="compare-status">{status}</p>}
      <div className={`compare-grid${single ? " single" : ""}`}>
        {!single && <ComparePane data={data} photos={sorted} selectedId={beforeId} onSelect={setBeforeId} onZoom={setZoomId} label="Before" />}
        <ComparePane data={data} photos={sorted} selectedId={afterId} onSelect={setAfterId} onZoom={setZoomId} label={single ? "Photo" : "After"} />
      </div>
      {!single && beforeId !== afterId && (
        <p className="compare-summary">{summaryFor(data, sorted.find((p) => p.id === beforeId)!, sorted.find((p) => p.id === afterId)!)}</p>
      )}
      {zoomId && <PhotoZoom data={data} photo={sorted.find((p) => p.id === zoomId)!} onClose={() => setZoomId(null)} />}
      <p className="compare-note compare-foot">The share card stamps the date, weight, and waist nearest each photo — nothing else leaves your device.</p>
    </div>,
    document.body
  );
}
