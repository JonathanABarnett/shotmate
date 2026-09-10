import type { AppData, SiteId } from "../../types";
import { DAY } from "../dates";
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
  /** the same site used twice in a row — the one rotation habit that actually matters */
  backToBack: boolean;
  /** shortest gap before any site got reused, in days; undefined until a site repeats */
  restDays?: number;
  redness: SiteRednessCount[];
}

/** Days between a site's reuse and its previous use, across the window — the tightest gap wins. */
function shortestRest(shots: { site: SiteId; ts: number }[]): number | undefined {
  let shortest: number | undefined;
  for (let i = 1; i < shots.length; i++) {
    const previous = shots.slice(0, i).reverse().find((s) => s.site === shots[i].site);
    if (!previous) continue;
    const days = (shots[i].ts - previous.ts) / DAY;
    shortest = shortest == null ? days : Math.min(shortest, days);
  }
  return shortest == null ? undefined : Math.round(shortest);
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
    backToBack: recent.some((s, i) => i > 0 && s.site === recent[i - 1].site),
    restDays: shortestRest(recent),
    redness: [...counts.entries()]
      .map(([site, count]) => ({ site, label: siteLabel(site), count }))
      .sort((a, b) => b.count - a.count),
  };
}
