import { usePhotoUrl } from "../hooks/usePhotoUrl";

interface Props {
  photoId: string;
  alt: string;
  className?: string;
}

/** An <img> fed from the photo store, with a shimmer square while loading. */
export default function PhotoThumb({ photoId, alt, className }: Props) {
  const url = usePhotoUrl(photoId);
  if (!url) return <span className={`photo-loading ${className ?? ""}`} aria-hidden="true" />;
  return <img className={className} src={url} alt={alt} />;
}
