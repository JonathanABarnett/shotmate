import type { Shot, SiteId } from "../types";

export interface SiteInfo {
  id: SiteId;
  label: string;
  short: string;
}

export const SITES: SiteInfo[] = [
  { id: "ab-l", label: "Left abdomen", short: "L abdomen" },
  { id: "ab-r", label: "Right abdomen", short: "R abdomen" },
  { id: "th-l", label: "Left thigh", short: "L thigh" },
  { id: "th-r", label: "Right thigh", short: "R thigh" },
  { id: "arm-l", label: "Left arm", short: "L arm" },
  { id: "arm-r", label: "Right arm", short: "R arm" },
];

export function siteLabel(id: SiteId): string {
  return SITES.find((s) => s.id === id)?.label ?? id;
}

export function lastUsedBySite(shots: Shot[]): Map<SiteId, number> {
  const map = new Map<SiteId, number>();
  for (const s of shots) {
    if (s.ts > (map.get(s.site) ?? 0)) map.set(s.site, s.ts);
  }
  return map;
}

/** Least-recently-used site — the friendly rotation suggestion. */
export function suggestedSite(shots: Shot[]): SiteId {
  const lastUsed = lastUsedBySite(shots);
  let best = SITES[0].id;
  let bestTs = Infinity;
  for (const { id } of SITES) {
    const ts = lastUsed.get(id) ?? -1;
    if (ts < bestTs) {
      bestTs = ts;
      best = id;
    }
  }
  return best;
}
