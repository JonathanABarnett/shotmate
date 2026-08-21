import type { AppData, Entry, Unit } from "../types";
import { fmtDayFull, startOfDay } from "./dates";
import { severityMeta } from "./effects";
import { fmtLength, lengthUnit, MEASURES } from "./measures";
import { siteLabel } from "./sites";
import { fmtWeight } from "./weight";

/** All entries across collections, newest first. */
export function buildEntries(data: AppData): Entry[] {
  const entries: Entry[] = [
    ...data.shots.map((item): Entry => ({ kind: "shot", item })),
    ...data.weights.map((item): Entry => ({ kind: "weight", item })),
    ...data.effects.map((item): Entry => ({ kind: "effect", item })),
    ...data.measures.map((item): Entry => ({ kind: "measure", item })),
    ...data.photos.map((item): Entry => ({ kind: "photo", item })),
    ...data.wins.map((item): Entry => ({ kind: "win", item })),
  ];
  return entries.sort((a, b) => b.item.ts - a.item.ts);
}

export interface EntrySummary {
  title: string;
  sub: string;
}

export function entrySummary(entry: Entry, unit: Unit): EntrySummary {
  switch (entry.kind) {
    case "shot": {
      const { doseMg, site, note } = entry.item;
      return { title: `Shot · ${doseMg} mg`, sub: note ? `${siteLabel(site)} — ${note}` : siteLabel(site) };
    }
    case "weight": {
      const { lbs, note } = entry.item;
      return { title: fmtWeight(lbs, unit), sub: note || "Weigh-in" };
    }
    case "effect": {
      const { effects, severity, note } = entry.item;
      const sev = severityMeta(severity);
      return {
        title: effects.join(", "),
        sub: note ? `${sev.label} ${sev.emoji} — ${note}` : `${sev.label} ${sev.emoji}`,
      };
    }
    case "measure": {
      const { valuesIn, note } = entry.item;
      const parts = MEASURES.filter((m) => valuesIn[m.key] != null).map(
        (m) => `${m.label} ${fmtLength(valuesIn[m.key]!, unit)}`
      );
      return {
        title: `${parts.slice(0, 3).join(" · ")}${parts.length > 3 ? ` +${parts.length - 3}` : ""} ${lengthUnit(unit)}`,
        sub: note || "Tape-measure check-in",
      };
    }
    case "photo":
      return { title: "Progress photo", sub: entry.item.note || "Tap to view or edit" };
    case "win":
      return { title: entry.item.text, sub: "Non-scale victory 🎉" };
  }
}

export interface DayGroup {
  day: number;
  label: string;
  entries: Entry[];
}

export function groupEntriesByDay(entries: Entry[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const entry of entries) {
    const day = startOfDay(entry.item.ts);
    const last = groups.at(-1);
    if (last && last.day === day) last.entries.push(entry);
    else groups.push({ day, label: fmtDayFull(day), entries: [entry] });
  }
  return groups;
}
