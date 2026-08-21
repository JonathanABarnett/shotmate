import type { Shot, SiteId } from "../types";
import { DAY } from "../lib/dates";
import { lastUsedBySite, SITES, suggestedSite } from "../lib/sites";

interface ZoneShape {
  id: SiteId;
  x: number;
  y: number;
  w: number;
  h: number;
}

/* Front-facing figure: the patient's LEFT is the viewer's RIGHT. */
const ZONES: ZoneShape[] = [
  { id: "ab-r", x: 70, y: 106, w: 27, h: 27 },
  { id: "ab-l", x: 103, y: 106, w: 27, h: 27 },
  { id: "th-r", x: 70, y: 160, w: 27, h: 38 },
  { id: "th-l", x: 103, y: 160, w: 27, h: 38 },
  { id: "arm-r", x: 37, y: 66, w: 21, h: 32 },
  { id: "arm-l", x: 142, y: 66, w: 21, h: 32 },
];

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
}

function FigureSilhouette() {
  return (
    <g className="silhouette">
      <circle cx="100" cy="30" r="19" />
      <rect x="88" y="46" width="24" height="14" rx="7" />
      <path d="M 66 58 Q 100 48 134 58 Q 142 100 136 142 Q 100 154 64 142 Q 58 100 66 58 Z" />
      <rect x="36" y="60" width="23" height="82" rx="11.5" transform="rotate(6 47 100)" />
      <rect x="141" y="60" width="23" height="82" rx="11.5" transform="rotate(-6 153 100)" />
      <rect x="68" y="144" width="30" height="102" rx="14" />
      <rect x="102" y="144" width="30" height="102" rx="14" />
    </g>
  );
}

export default function BodyMap({ shots, selected, onSelect }: Props) {
  const suggestion = suggestedSite(shots);
  const lastUsed = lastUsedBySite(shots);
  const now = Date.now();

  return (
    <div className="bodymap-wrap">
      <svg className="bodymap" width="152" height="216" viewBox="14 6 172 244" aria-hidden="true">
        <FigureSilhouette />
        {ZONES.map((z) => {
          const isSelected = z.id === selected;
          const classes = ["zone", isSelected && "selected", z.id === suggestion && "suggested"].filter(Boolean).join(" ");
          return (
            <g key={z.id}>
              <rect className={classes} x={z.x} y={z.y} width={z.w} height={z.h} rx={10} onClick={() => onSelect(z.id)} />
              {isSelected && <circle className="zone-dot" cx={z.x + z.w / 2} cy={z.y + z.h / 2} r={4} />}
            </g>
          );
        })}
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
