import type { AppData } from "../types";
import { isAppData, withDataDefaults } from "./persistence";
import { loadPhotoBlob, savePhotoBlob } from "./photoStore";

interface BackupFile extends AppData {
  /** photo pixels, base64 data-URLs keyed by photo id */
  photoBlobs?: Record<string, string>;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function collectPhotoBlobs(data: AppData): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const photo of data.photos) {
    const blob = await loadPhotoBlob(photo.id);
    if (blob) out[photo.id] = await blobToDataUrl(blob);
  }
  return out;
}

/** Download the user's data — photos included — as a JSON backup file. */
export async function downloadBackup(data: AppData): Promise<void> {
  const backup: BackupFile = { ...data, photoBlobs: await collectPhotoBlobs(data) };
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shotmate-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function restorePhotoBlobs(photoBlobs: Record<string, string>): Promise<void> {
  for (const [id, dataUrl] of Object.entries(photoBlobs)) {
    const blob = await (await fetch(dataUrl)).blob();
    await savePhotoBlob(id, blob);
  }
}

/** Parse a backup file; resolves to null when the file isn't a valid backup. */
export async function parseBackupFile(file: File): Promise<AppData | null> {
  try {
    const parsed: unknown = JSON.parse(await file.text());
    if (!isAppData(parsed)) return null;
    const { photoBlobs, ...data } = parsed as BackupFile;
    if (photoBlobs) await restorePhotoBlobs(photoBlobs);
    return withDataDefaults({ ...data, onboarded: true });
  } catch {
    return null;
  }
}
