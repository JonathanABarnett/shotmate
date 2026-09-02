import type { BodyType, Shot, SiteId } from "../types";
import { DAY } from "../lib/dates";
import { siteZones } from "../lib/figure";
import { lastUsedBySite, SITES, suggestedSite } from "../lib/sites";
import FigureSilhouette from "./FigureSilhouette";

function usedLabel(lastUsedTs: number | undefined, now: number): string {
  if (!lastUsedTs) return "never used";
  const days = Math.floor((now - lastUsedTs) / DAY);
  if (days === 0) return "used today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

interface Props {
  shots: Shot[];
  selected: SiteId;
  onSelect: (site: SiteId) => void;
  bodyType?: BodyType;
  /** true = "as you look down at yourself" (your left on the left); false = facing you */
  mirror?: boolean;
}

export default function BodyMap({ shots, selected, onSelect, bodyType, mirror }: Props) {
  const suggestion = suggestedSite(shots);
  const lastUsed = lastUsedBySite(shots);
  const now = Date.now();
  const zones = siteZones(bodyType);

  return (
    <div className="bodymap-wrap">
      <svg className="bodymap" width="152" height="216" viewBox="14 6 172 244" aria-hidden="true">
        <g transform={mirror ? "translate(200 0) scale(-1 1)" : undefined}>
          <FigureSilhouette bodyType={bodyType} />
          {zones.map((z) => {
            const isSelected = z.id === selected;
            const classes = ["zone", isSelected && "selected", z.id === suggestion && "suggested"].filter(Boolean).join(" ");
            return (
              <g key={z.id}>
                <rect className={classes} x={z.x} y={z.y} width={z.w} height={z.h} rx={10} onClick={() => onSelect(z.id)} />
                {isSelected && <circle className="zone-dot" cx={z.x + z.w / 2} cy={z.y + z.h / 2} r={4} />}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="site-list" role="radiogroup" aria-label="Injection site">
        {SITES.map((site) => {
          const isSelected = site.id === selected;
          return (
            <button
              key={site.id}
              role="radio"
              aria-checked={isSelected}
              className={`site-row${isSelected ? " selected" : ""}`}
              onClick={() => onSelect(site.id)}
            >
              <span>{site.short}</span>
              {site.id === suggestion ? (
                <span className="suggested-tag">✦ next up</span>
              ) : (
                <span className="site-meta">{usedLabel(lastUsed.get(site.id), now)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
