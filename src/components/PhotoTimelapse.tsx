import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Pause, Play, X } from "lucide-react";
import type { AppData, PhotoEntry } from "../types";
import { fmtDay, fmtDayFull } from "../lib/dates";
import { photoDetails, photoStats } from "../lib/photoStats";
import { shareOrDownload } from "../lib/shareCard";
import { renderTimelapse, timelapseSupported, type TimelapseFrame } from "../lib/timelapse";
import { loadPhotoBlob } from "../store/photoStore";
import PhotoThumb from "./PhotoThumb";

const FRAME_MS = 900;
const LAST_FRAME_MS = 1800;

interface Props {
  data: AppData;
  photos: PhotoEntry[];
  onClose: () => void;
}

/** Every photo, oldest to newest, as a flipbook — with a one-tap export to a real video. */
export default function PhotoTimelapse({ data, photos, onClose }: Props) {
  const sorted = [...photos].sort((a, b) => a.ts - b.ts);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>();

  useEffect(() => {
    if (!playing) return;
    const last = index === sorted.length - 1;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % sorted.length), last ? LAST_FRAME_MS : FRAME_MS);
    return () => clearTimeout(timer);
  }, [playing, index, sorted.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const exportVideo = async () => {
    if (busy) return;
    setBusy(true);
    setPlaying(false);
    setStatus("Rendering your reel…");
    try {
      const frames: TimelapseFrame[] = [];
      for (const p of sorted) {
        const image = await loadPhotoBlob(p.id);
        if (image) frames.push({ image, caption: fmtDay(p.ts), stats: photoStats(data, p.ts).stats, focus: p.focus, zoom: p.zoom });
      }
      const { blob, ext } = await renderTimelapse(frames);
      const outcome = await shareOrDownload(blob, `shotmate-timelapse.${ext}`);
      setStatus(outcome === "shared" ? "Shared 🎉" : "Saved to your downloads 🎉");
    } catch {
      setStatus("Couldn't render the reel — try again");
    }
    setBusy(false);
  };

  const photo = sorted[index];
  const details = photoDetails(data, photo.ts);

  return createPortal(
    <div className="timelapse" role="dialog" aria-modal="true">
      <button className="icon-btn zoom-close" aria-label="Close time-lapse" onClick={onClose}>
        <X size={20} />
      </button>
      <div className="timelapse-stage" onClick={() => setPlaying((p) => !p)}>
        {sorted.map((p, i) => (
          <div className={`timelapse-frame${i === index ? " active" : ""}`} key={p.id}>
            <PhotoThumb photoId={p.id} alt={`Photo from ${fmtDayFull(p.ts)}`} className="timelapse-img" focus={p.focus} zoom={p.zoom} />
          </div>
        ))}
        <div className="zoom-info">
          <div className="zoom-date">
            {fmtDayFull(photo.ts)} · {index + 1} / {sorted.length}
          </div>
          {details.weight && <div className="zoom-weight">{details.weight}</div>}
          {details.tapes.length > 0 && <div className="zoom-tapes">{details.tapes.join("  ·  ")}</div>}
        </div>
      </div>
      <div className="timelapse-controls">
        <button className="icon-btn timelapse-btn" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
        {timelapseSupported() && (
          <button className="btn btn-subtle btn-sm" onClick={exportVideo} disabled={busy}>
            <Download size={15} /> Save as video
          </button>
        )}
        {status && <span className="timelapse-status">{status}</span>}
      </div>
      <p className="timelapse-note">Tap the photo to pause. The video stamps each date, weight, and waist — nothing else leaves your device.</p>
    </div>,
    document.body
  );
}