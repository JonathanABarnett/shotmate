import { X } from "lucide-react";
import ChartStats from "../../components/ChartStats";
import type { WeeklyRecap } from "../../lib/weeklyRecap";

interface Props {
  recap: WeeklyRecap;
  onDismiss: () => void;
}

/** The Sunday letter — three kind sentences about the week. */
export default function RecapCard({ recap, onDismiss }: Props) {
  return (
    <section className="card recap-card">
      <div className="card-title-row">
        <h3 className="card-title">Your week, in short 💌</h3>
        <button className="nudge-dismiss" aria-label="Thanks" onClick={onDismiss}>
          <X size={16} />
        </button>
      </div>
      <p className="recap-text">{recap.narrative}</p>
      {recap.stats.length > 0 && <ChartStats stats={recap.stats} />}
    </section>
  );
}
