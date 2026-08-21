import type { AppData, SiteId } from "../../types";
import { siteLabel } from "../sites";
import { sortedShots } from "../shots";

export interface SiteRednessCount {
  site: SiteId;
  label: string;
  count: number;
}

export interface SiteHealth {
  recentShots: number;
  distinctSites: number;
  redness: SiteRednessCount[];
}

const ROTATION_WINDOW = 6;
const MIN_SHOTS = 3;
const REDNESS_EFFECT = "Injection site redness";

/** Are you rotating, and is any site complaining? */
export function siteRotationHealth(data: AppData): SiteHealth | undefined {
  const shots = sortedShots(data.shots);
  if (shots.length < MIN_SHOTS) return undefined;
  const recent = shots.slice(-ROTATION_WINDOW);

  const counts = new Map<SiteId, number>();
  for (const effect of data.effects) {
    if (!effect.effects.includes(REDNESS_EFFECT)) continue;
    const shot = [...shots].reverse().find((s) => s.ts <= effect.ts);
    if (shot) counts.set(shot.site, (counts.get(shot.site) ?? 0) + 1);
  }

  return {
    recentShots: recent.length,
    distinctSites: new Set(recent.map((s) => s.site)).size,
    redness: [...counts.entries()]
      .map(([site, count]) => ({ site, label: siteLabel(site), count }))
      .sort((a, b) => b.count - a.count),
  };
}
