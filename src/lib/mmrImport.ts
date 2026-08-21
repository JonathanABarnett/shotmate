import type { ActivityEntry, ActivityType } from "../types";
import { uid } from "./ids";

/** Parse one CSV line, honoring quoted fields with embedded commas. */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += ch;
    }
  }
  cells.push(cell);
  return cells.map((c) => c.trim());
}

function findColumn(headers: string[], pattern: RegExp): number {
  return headers.findIndex((h) => pattern.test(h));
}

function toActivityType(raw: string): ActivityType {
  if (/run|jog/i.test(raw)) return "run";
  if (/walk|hike/i.test(raw)) return "walk";
  if (/ride|bike|cycl|spin/i.test(raw)) return "ride";
  if (/strength|weight|gym|lift|circuit/i.test(raw)) return "strength";
  return "other";
}

function parseWorkoutDate(raw: string): number | undefined {
  let ts = Date.parse(raw);
  if (Number.isNaN(ts)) {
    // "Sept. 3, 2026" style — trim month to three letters, drop the period.
    ts = Date.parse(raw.replace(/^([A-Za-z]{3})[A-Za-z]*\.?/, "$1"));
  }
  return Number.isNaN(ts) ? undefined : ts;
}

export interface MmrImportResult {
  entries: ActivityEntry[];
  skipped: number;
}

/**
 * Parse a MapMyRun workout-history CSV export (mapmyrun.com → Workouts →
 * export). Tolerant of column order; rows it can't read are counted, not fatal.
 */
export function parseMmrCsv(text: string): MmrImportResult | null {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return null;

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const dateCol = findColumn(headers, /workout date|date submitted|^date$/);
  const typeCol = findColumn(headers, /activity type/);
  const secondsCol = findColumn(headers, /workout time.*sec|time.*seconds/);
  const minutesCol = findColumn(headers, /workout time.*min|duration.*min/);
  const distanceCol = findColumn(headers, /distance.*mi/);
  const notesCol = findColumn(headers, /^notes$/);
  if (dateCol < 0 || typeCol < 0 || (secondsCol < 0 && minutesCol < 0)) return null;

  const entries: ActivityEntry[] = [];
  let skipped = 0;
  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    const ts = parseWorkoutDate(cells[dateCol] ?? "");
    const rawDuration = parseFloat(cells[secondsCol >= 0 ? secondsCol : minutesCol] ?? "");
    const minutes = secondsCol >= 0 ? rawDuration / 60 : rawDuration;
    if (ts == null || !Number.isFinite(minutes) || minutes <= 0) {
      skipped++;
      continue;
    }
    const distanceMi = distanceCol >= 0 ? parseFloat(cells[distanceCol]) : NaN;
    entries.push({
      id: uid(),
      ts,
      type: toActivityType(cells[typeCol] ?? ""),
      minutes: Math.round(minutes),
      distanceMi: Number.isFinite(distanceMi) && distanceMi > 0 ? Math.round(distanceMi * 100) / 100 : undefined,
      note: notesCol >= 0 && cells[notesCol] ? cells[notesCol] : undefined,
      imported: true,
    });
  }
  return { entries, skipped };
}
