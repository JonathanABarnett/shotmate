import Confetti from "../../components/Confetti";
import type { Milestone } from "../../lib/milestones";

interface Props {
  milestone: Milestone;
  onSaveWin: () => void;
  onDone: () => void;
}

/** Full celebration for a trend-crossed weight milestone — confetti and all. */
export default function CelebrationCard({ milestone, onSaveWin, onDone }: Props) {
  return (
    <section className="card celebrate-card">
      <Confetti />
      <div className="celebrate-emoji" aria-hidden="true">
        {milestone.emoji}
      </div>
      <h3 className="celebrate-title">{milestone.title}</h3>
      <p className="celebrate-sub">{milestone.sub}</p>
      <div className="celebrate-actions">
        <button className="btn btn-primary" onClick={onSaveWin}>
          Save as a win 🎉
        </button>
        <button className="btn btn-subtle" onClick={onDone}>
          Keep going ✨
        </button>
      </div>
    </section>
  );
}
