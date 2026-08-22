import { useRef, useState } from "react";
import type { PhotoFocus } from "../types";

interface Props {
  url: string;
  focus: PhotoFocus;
  onChange: (focus: PhotoFocus) => void;
  onReplace: () => void;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * The 3:4 frame every photo view uses, with the photo draggable inside it.
 * The resulting focal point (0..1 per axis, like CSS object-position) is what
 * thumbnails, the compare view, and the share card crop around.
 */
export default function PhotoCropFrame({ url, focus, onChange, onReplace }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null);
  const [pannable, setPannable] = useState(false);

  /** How many px of the cover-scaled image hang outside the frame on each axis. */
  const overflow = () => {
    const frame = frameRef.current?.getBoundingClientRect();
    const img = imgRef.current;
    if (!frame || !img || !img.naturalWidth) return { x: 0, y: 0 };
    const scale = Math.max(frame.width / img.naturalWidth, frame.height / img.naturalHeight);
    return { x: img.naturalWidth * scale - frame.width, y: img.naturalHeight * scale - frame.height };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, fx: focus.x, fy: focus.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const o = overflow();
    onChange({
      x: o.x > 1 ? clamp01(drag.current.fx - (e.clientX - drag.current.x) / o.x) : 0.5,
      y: o.y > 1 ? clamp01(drag.current.fy - (e.clientY - drag.current.y) / o.y) : 0.5,
    });
  };
  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div
      ref={frameRef}
      className="photo-frame"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <img
        ref={imgRef}
        src={url}
        alt="Progress"
        draggable={false}
        style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
        onLoad={() => {
          const o = overflow();
          setPannable(o.x > 1 || o.y > 1);
        }}
      />
      {pannable && <span className="photo-frame-hint">Drag to choose the crop</span>}
      <button className="photo-replace" onPointerDown={(e) => e.stopPropagation()} onClick={onReplace}>
        Replace
      </button>
    </div>
  );
}
