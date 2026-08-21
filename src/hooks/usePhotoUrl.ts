import { useEffect, useState } from "react";
import { loadPhotoBlob } from "../store/photoStore";

/** Object URL for a stored photo, revoked on unmount/change. */
export function usePhotoUrl(id: string | undefined): string | undefined {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!id) {
      setUrl(undefined);
      return;
    }
    let alive = true;
    let objectUrl: string | undefined;
    loadPhotoBlob(id).then((blob) => {
      if (alive && blob) {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      }
    });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setUrl(undefined);
    };
  }, [id]);

  return url;
}
