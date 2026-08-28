import type { AppData } from "../types";
import { DAY, dayStreak, startOfDay } from "./dates";
import { proteinGoal } from "./intake";

export interface WinSuggestion {
  key: string;
  text: string;
}

const HANDLED_KEY = "shotmate-win-suggested";
const RECENT_DAYS = 3;

function handledKeys(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(HANDLED_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export function markWinSuggestionHandled(key: string): void {
  try {
    const keys = handledKeys();
    keys.add(key);
    localStorage.setItem(HANDLED_KEY, JSON.stringify([...keys]));
  } catch {
    // storage unavailable — the suggestion just shows again
  }
}

function candidates(data: AppData, now: number): WinSuggestion[] {
  const list: WinSuggestion[] = [];

  const acts = [...data.activities].sort((a, b) => a.ts - b.ts);
  const last = acts.at(-1);
  if (last && now - last.ts <= RECENT_DAYS * DAY && last.minutes >= 20) {
    const previousBest = Math.max(0, ...acts.slice(0, -1).map((a) => a.minutes));
    if (last.minutes >= previousBest + 5) {
      list.push({ key: `move-best-${last.minutes}`, text: `Longest ${last.type} yet — ${last.minutes} minutes 👟` });
    }
  }
  const checkins = dayStreak(new Set(data.checkins.map((c) => c.day)), now);
  for (const n of [30, 14, 7]) {
    if (checkins >= n) {
      list.push({ key: `checkin-streak-${n}`, text: n === 7 ? "A full week of daily check-ins 🧭" : `${n} days of daily check-ins 🧭` });
      break;
    }
  }
  const weighs = dayStreak(new Set(data.weights.map((w) => startOfDay(w.ts))), now);
  for (const n of [30, 14, 7]) {
    if (weighs >= n) {
      list.push({ key: `weigh-streak-${n}`, text: `${n} straight days on the scale — fearless 📅` });
      break;
    }
  }
  const goal = proteinGoal(data);
  const proteinDays = dayStreak(new Set(data.intake.filter((i) => i.proteinG >= goal).map((i) => i.day)), now);
  if (proteinDays >= 3) list.push({ key: "protein-streak-3", text: `Protein goal ${proteinDays} days running 🥩` });

  return list;
}

/** A win the data spotted that hasn't been saved or waved off yet. */
export function suggestedWin(data: AppData, now = Date.now()): WinSuggestion | undefined {
  if (data.sample || !data.onboarded) return undefined;
  const handled = handledKeys();
  return candidates(data, now).find((c) => !handled.has(c.key));
}
