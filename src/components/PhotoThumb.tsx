import type { PhotoFocus } from "../types";
import { usePhotoUrl } from "../hooks/usePhotoUrl";

interface Props {
  photoId: string;
  alt: string;
  className?: string;
  /** crop focal point; defaults to the center */
  focus?: PhotoFocus;
}

/** CSS object-position for a focal point (center when unset). */
export const objectPosition = (focus?: PhotoFocus) => `${(focus?.x ?? 0.5) * 100}% ${(focus?.y ?? 0.5) * 100}%`;

/** An <img> fed from the photo store, with a shimmer square while loading. */
export default function PhotoThumb({ photoId, alt, className, focus }: Props) {
  const url = usePhotoUrl(photoId);
  if (!url) return <span className={`photo-loading ${className ?? ""}`} aria-hidden="true" />;
  return <img className={className} src={url} alt={alt} style={{ objectPosition: objectPosition(focus) }} />;
}
