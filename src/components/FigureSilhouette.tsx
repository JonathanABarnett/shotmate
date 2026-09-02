import type { BodyType } from "../types";
import { figurePaths, figureShape } from "../lib/figure";

/**
 * Front-facing body outline in a 200×250 coordinate space (head at 100,27; feet at y≈246),
 * shaped by the chosen body type. Shared by the injection-site picker and the body snapshot —
 * style via `.silhouette`.
 */
export default function FigureSilhouette({ bodyType }: { bodyType?: BodyType }) {
  const paths = figurePaths(figureShape(bodyType));
  return (
    <g className="silhouette">
      <ellipse cx="100" cy="24" rx="14.5" ry="16.5" />
      <path d={paths.core} />
      <path d={paths.leftArm} />
      <path d={paths.rightArm} />
    </g>
  );
}
