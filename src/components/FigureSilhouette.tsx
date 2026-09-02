import type { BodyType } from "../types";
import { FIGURE_D, figureTransform } from "../lib/figure";

/**
 * Front-facing body silhouette in the 200×250 figure space — public-domain
 * artwork placed by `figureTransform`, width-scaled by the chosen body type.
 * Shared by the injection-site picker and the body snapshot — style via `.silhouette`.
 */
export default function FigureSilhouette({ bodyType }: { bodyType?: BodyType }) {
  return (
    <g className="silhouette">
      <path d={FIGURE_D} transform={figureTransform(bodyType)} />
    </g>
  );
}
