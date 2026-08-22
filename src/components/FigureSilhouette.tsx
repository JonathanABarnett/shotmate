/**
 * Front-facing body outline in a 200×250 coordinate space (head at 100,27; feet at y≈246).
 * Shared by the injection-site picker and the body snapshot — style via `.silhouette`.
 * Landmarks other components rely on: shoulders ≈ y 60–70, waist x 70–130 at y ≈ 124,
 * hips ≈ y 150, left leg x 64–99 / right leg x 101–136, arms x 36–60 / 140–164.
 */
const LEFT_ARM = "M 60 70 C 48 74 40 90 38 110 C 36 126 36 140 38 150 C 40 157 52 157 54 150 C 56 136 56 120 56 106 C 56 92 60 80 66 70 Z";
const RIGHT_ARM = "M 140 70 C 152 74 160 90 162 110 C 164 126 164 140 162 150 C 160 157 148 157 146 150 C 144 136 144 120 144 106 C 144 92 140 80 134 70 Z";
const LEFT_LEG = "M 64 150 C 62 176 66 200 68 222 C 68 238 72 246 82 246 C 92 246 96 240 96 230 C 96 210 98 180 99 152 Z";
const RIGHT_LEG = "M 136 150 C 138 176 134 200 132 222 C 132 238 128 246 118 246 C 108 246 104 240 104 230 C 104 210 102 180 101 152 Z";
const TORSO =
  "M 92 56 C 78 57 66 60 60 70 C 58 78 60 92 66 104 C 70 112 70 118 70 124 C 70 134 64 142 64 152 L 136 152 C 136 142 130 134 130 124 C 130 118 130 112 134 104 C 140 92 142 78 140 70 C 134 60 122 57 108 56 Z";

export default function FigureSilhouette() {
  return (
    <g className="silhouette">
      <ellipse cx="100" cy="27" rx="17.5" ry="20" />
      <rect x="92" y="44" width="16" height="16" rx="4" />
      <path d={LEFT_ARM} />
      <path d={RIGHT_ARM} />
      <path d={TORSO} />
      <path d={LEFT_LEG} />
      <path d={RIGHT_LEG} />
    </g>
  );
}
