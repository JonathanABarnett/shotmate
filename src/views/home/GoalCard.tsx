import type { AppData } from "../../types";
import { fmtWeight, goalProgress } from "../../lib/weight";

function encouragement(pct: number): string {
  if (pct >= 1) return "Goal reached — incredible! 🎉";
  if (pct >= 0.75) return "So close — the home stretch! 🌟";
  if (pct >= 0.5) return "Past halfway — amazing work! 🎉";
  if (pct >= 0.25) return "Great momentum — keep it up! 💪";
  return "Every step counts — you've started! 🌱";
}

interface Props {
  data: AppData;
  onOpenSettings: () => void;
}

export default function GoalCard({ data, onOpenSettings }: Props) {
  const progress = goalProgress(data);

  if (!progress) {
    if (data.weights.length === 0) return null;
    return (
      <section className="card">
        <div className="card-title-row">
          <h3 className="card-title">Goal</h3>
        </div>
        <p className="goal-caption">
          Set a goal weight to see your progress here.{" "}
          <button className="link-btn" onClick={onOpenSettings}>
            Set it up
          </button>
        </p>
      </section>
    );
  }

  const { pct, lostLbs, toGoLbs } = progress;
  const unit = data.settings.unit;

  return (
    <section className="card">
      <div className="goal-row">
        <span>
          <strong>{fmtWeight(lostLbs, unit)}</strong> down
        </span>
        <span>{Math.round(pct * 100)}%</span>
      </div>
      <div className="progress-track" role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${Math.max(3, pct * 100)}%` }} />
      </div>
      <p className="goal-caption">
        {fmtWeight(toGoLbs, unit)} to your goal of {fmtWeight(data.settings.goalLbs!, unit)}. {encouragement(pct)}
      </p>
    </section>
  );
}
