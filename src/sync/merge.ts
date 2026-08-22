import type { AppData } from "../types";

const unionById = <T extends { id: string }>(primary: T[], secondary: T[]): T[] => {
  const seen = new Set(primary.map((x) => x.id));
  return [...primary, ...secondary.filter((x) => !seen.has(x.id))];
};

const unionByDay = <T extends { day: number }>(primary: T[], secondary: T[]): T[] => {
  const seen = new Set(primary.map((x) => x.day));
  return [...primary, ...secondary.filter((x) => !seen.has(x.day))];
};

/**
 * First time a device joins an account that already has a snapshot: keep every
 * entry from both sides (ids are unique), take the account's settings, and keep
 * this device's photos. Local sample data or an un-onboarded device contributes
 * nothing. Stamped "now" so the merged result is pushed back up.
 */
export function mergeSnapshots(remote: AppData, local: AppData): AppData {
  const contribute = local.onboarded && !local.sample;
  const pick = <T extends { id: string }>(r: T[], l: T[]) => (contribute ? unionById(r, l) : r);
  const pickDays = <T extends { day: number }>(r: T[], l: T[]) => (contribute ? unionByDay(r, l) : r);
  return {
    ...remote,
    onboarded: true,
    sample: false,
    shots: pick(remote.shots, local.shots),
    weights: pick(remote.weights, local.weights),
    effects: pick(remote.effects, local.effects),
    measures: pick(remote.measures, local.measures),
    wins: pick(remote.wins, local.wins),
    activities: pick(remote.activities, local.activities),
    vitals: pick(remote.vitals, local.vitals),
    intake: pickDays(remote.intake, local.intake),
    checkins: pickDays(remote.checkins, local.checkins),
    seenAchievements: [...new Set([...remote.seenAchievements, ...(contribute ? local.seenAchievements : [])])],
    photos: local.photos,
    updatedAt: Date.now(),
  };
}
