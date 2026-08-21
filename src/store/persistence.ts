import type { AppData } from "../types";
import { defaultSettings, emptyData } from "../lib/defaults";
import { sampleData } from "../lib/sample";

const STORAGE_KEY = "shotmate-data-v1";

/** `?demo` shows the app pre-filled with sample data — handy for demos and screenshots. */
export function isDemoRequest(): boolean {
  return new URLSearchParams(window.location.search).has("demo");
}

export function isAppData(json: unknown): json is AppData {
  if (!json || typeof json !== "object") return false;
  const d = json as Partial<AppData>;
  return (
    d.v === 1 &&
    !!d.settings &&
    Array.isArray(d.shots) &&
    Array.isArray(d.weights) &&
    Array.isArray(d.effects)
  );
}

/** Fill in collections added after a stored snapshot was written. */
export function withDataDefaults(data: AppData): AppData {
  return {
    ...data,
    measures: data.measures ?? [],
    photos: data.photos ?? [],
    wins: data.wins ?? [],
    intake: data.intake ?? [],
    activities: data.activities ?? [],
    checkins: data.checkins ?? [],
  };
}

export function loadStoredData(): AppData {
  if (isDemoRequest()) return sampleData(defaultSettings());
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isAppData(parsed)) return withDataDefaults(parsed);
    }
  } catch {
    // corrupted storage — start fresh rather than crash
  }
  return emptyData();
}

export function saveStoredData(data: AppData): void {
  if (isDemoRequest()) return; // demo mode is ephemeral — never touch real data
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — data stays in memory for the session
  }
}
