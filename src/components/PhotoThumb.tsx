import type { PhotoFocus } from "../types";
import { usePhotoUrl } from "../hooks/usePhotoUrl";

interface Props {
  photoId: string;
  alt: string;
  className?: string;
  /** crop focal point; defaults to the center */
  focus?: PhotoFocus;
  /** crop zoom around the focal point; 1/undefined = plain cover crop */
  zoom?: number;
}

/** CSS object-position for a focal point (center when unset). */
export const objectPosition = (focus?: PhotoFocus) => `${(focus?.x ?? 0.5) * 100}% ${(focus?.y ?? 0.5) * 100}%`;

/** An <img> in a clipping wrap, fed from the photo store, with a shimmer square while loading. */
export default function PhotoThumb({ photoId, alt, className, focus, zoom }: Props) {
  const url = usePhotoUrl(photoId);
  if (!url) return <span className={`photo-loading ${className ?? ""}`} aria-hidden="true" />;
  const pos = objectPosition(focus);
  const z = zoom != null && zoom > 1 ? zoom : undefined;
  return (
    <span className={`photo-wrap ${className ?? ""}`}>
      <img
        src={url}
        alt={alt}
        style={{ objectPosition: pos, ...(z ? { transform: `scale(${z})`, transformOrigin: pos } : {}) }}
      />
    </span>
  );
}
