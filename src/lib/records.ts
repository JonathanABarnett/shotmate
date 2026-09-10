import type { ActivityEntry, WeightEntry } from "../types";

const MIN_PRIOR_WEIGHINS = 3;
const MIN_RECORD_MINUTES = 20;

/** A weigh-in below every earlier one — needs a few priors so the first days don't all count. */
export function isNewLow(previous: WeightEntry[], entry: WeightEntry): boolean {
  return previous.length >= MIN_PRIOR_WEIGHINS && entry.lbs < Math.min(...previous.map((w) => w.lbs));
}

/** Longer than any activity before it — and long enough to mean something. */
export function isLongestYet(previous: ActivityEntry[], entry: ActivityEntry): boolean {
  const best = Math.max(0, ...previous.map((a) => a.minutes));
  return entry.minutes >= MIN_RECORD_MINUTES && entry.minutes > best;
}
