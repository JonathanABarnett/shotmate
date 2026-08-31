import { findColumn, parseCsvLine } from "./csv";
import { startOfDay } from "./dates";

export interface ImportedIntakeDay {
  day: number;
  kcal: number;
  proteinG?: number;
}

export interface LoseItImportResult {
  days: ImportedIntakeDay[];
  skipped: number;
}

/**
 * Parse a Lose It CSV export (loseit.com → Insights → Export). Handles both
 * the per-food log and daily-summary shapes — rows group by date either way.
 * Deleted rows are ignored; rows it can't read are counted, not fatal.
 */
export function parseLoseItCsv(text: string): LoseItImportResult | null {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return null;
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const dateCol = findColumn(headers, /date/);
  const kcalCol = findColumn(headers, /calorie/);
  const proteinCol = findColumn(headers, /protein/);
  const deletedCol = findColumn(headers, /deleted/);
  if (dateCol < 0 || kcalCol < 0) return null;

  const numberIn = (raw: string | undefined) => parseFloat((raw ?? "").replace(/[^0-9.-]/g, ""));
  const byDay = new Map<number, { kcal: number; proteinG: number; hasProtein: boolean }>();
  let skipped = 0;
  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    if (deletedCol >= 0 && /^(true|1|yes)$/i.test(cells[deletedCol] ?? "")) continue;
    const ts = Date.parse(cells[dateCol] ?? "");
    const kcal = numberIn(cells[kcalCol]);
    if (Number.isNaN(ts) || !Number.isFinite(kcal)) {
      skipped++;
      continue;
    }
    const day = startOfDay(ts);
    const agg = byDay.get(day) ?? { kcal: 0, proteinG: 0, hasProtein: false };
    agg.kcal += kcal;
    const protein = proteinCol >= 0 ? numberIn(cells[proteinCol]) : NaN;
    if (Number.isFinite(protein)) {
      agg.proteinG += protein;
      agg.hasProtein = true;
    }
    byDay.set(day, agg);
  }
  const days = [...byDay.entries()]
    .map(([day, a]) => ({ day, kcal: Math.round(a.kcal), ...(a.hasProtein ? { proteinG: Math.round(a.proteinG) } : {}) }))
    .filter((d) => d.kcal > 0)
    .sort((a, b) => a.day - b.day);
  return { days, skipped };
}
