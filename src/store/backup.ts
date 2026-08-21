import type { AppData } from "../types";
import { isAppData } from "./persistence";

/** Download the user's data as a JSON backup file. */
export function downloadBackup(data: AppData): void {
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shotmate-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse a backup file; resolves to null when the file isn't a valid backup. */
export async function parseBackupFile(file: File): Promise<AppData | null> {
  try {
    const parsed: unknown = JSON.parse(await file.text());
    if (!isAppData(parsed)) return null;
    return { ...parsed, onboarded: true };
  } catch {
    return null;
  }
}
