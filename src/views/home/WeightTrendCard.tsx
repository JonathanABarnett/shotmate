import { ChevronRight } from "lucide-react";
import type { AppData } from "../../types";
import { fmtWeight, latestWeight } from "../../lib/weight";
import Sparkline from "../../components/charts/Sparkline";

interface Props {
  data: AppData;
  onSeeTrends: () => void;
}

export default function WeightTrendCard({ data, onSeeTrends }: Props) {
  if (data.weights.length < 2) return null;
  const latest = latestWeight(data.weights)!;

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
      <Sparkline weights={data.weights} unit={data.settings.unit} />
    </section>
  );
}
