import { ChevronRight } from "lucide-react";
import type { AppData } from "../../types";
import { fmtWeight, latestWeight, sortedWeights, toDisplayWeight } from "../../lib/weight";
import Sparkline from "../../components/charts/Sparkline";

const SPARK_POINTS = 30;

interface Props {
  data: AppData;
  onSeeTrends: () => void;
}

export default function WeightTrendCard({ data, onSeeTrends }: Props) {
  if (data.weights.length < 2) return null;
  const latest = latestWeight(data.weights)!;
  const points = sortedWeights(data.weights)
    .slice(-SPARK_POINTS)
    .map((w) => ({ ts: w.ts, value: toDisplayWeight(w.lbs, data.settings.unit) }));

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Weight trend</h3>
          <div className="card-sub">Latest: {fmtWeight(latest.lbs, data.settings.unit)}</div>
        </div>
        <button className="link-btn" onClick={onSeeTrends}>
          See trends <ChevronRight size={15} />
        </button>
      </div>
      <Sparkline points={points} />
    </section>
  );
}
