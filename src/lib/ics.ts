import type { AppData } from "../types";
import { medFor } from "./meds";
import { nextDueTs } from "./shots";

function icsUtc(ts: number): string {
  return new Date(ts).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** A recurring "shot day" calendar event starting at the next due date. */
export function buildShotDayIcs(data: AppData): string | undefined {
  const { scheduleDays, plannedDoseMg } = data.settings;
  const due = nextDueTs(data.shots, scheduleDays);
  if (due == null) return undefined;

  const med = medFor(data.settings);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ShotMate//EN",
    "BEGIN:VEVENT",
    `UID:shotmate-shot-day-${due}@shotmate.local`,
    `DTSTAMP:${icsUtc(Date.now())}`,
    `DTSTART:${icsUtc(due)}`,
    "DURATION:PT30M",
    `RRULE:FREQ=DAILY;INTERVAL=${scheduleDays}`,
    `SUMMARY:💉 Shot day — ${med.brand} ${plannedDoseMg} mg`,
    "DESCRIPTION:Reminder from ShotMate. Log it in the app after your shot!",
    "BEGIN:VALARM",
    "TRIGGER:PT0S",
    "ACTION:DISPLAY",
    "DESCRIPTION:Shot day",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadShotDayIcs(data: AppData): boolean {
  const ics = buildShotDayIcs(data);
  if (!ics) return false;
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shotmate-shot-day.ics";
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
