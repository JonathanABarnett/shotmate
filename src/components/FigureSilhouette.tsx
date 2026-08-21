/**
 * Front-facing body outline in a 200×250 coordinate space (head at 100,30; feet at y≈246).
 * Shared by the injection-site picker and the body snapshot — style via `.silhouette`.
 */
export default function FigureSilhouette() {
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
