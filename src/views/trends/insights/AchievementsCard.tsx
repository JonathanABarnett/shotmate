import type { Achievement } from "../../../lib/achievements";

const NEXT_UP = 3;

export default function AchievementsCard({ items }: { items: Achievement[] }) {
  const earned = items.filter((a) => a.earned);
  const nextUp = items
    .filter((a) => !a.earned)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, NEXT_UP);

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Achievements</h3>
          <div className="card-sub">
            {earned.length} of {items.length} unlocked
          </div>
        </div>
      </div>
      {earned.length > 0 ? (
        <div className="ach-grid">
          {earned.map((a) => (
            <div className="ach-badge" key={a.key} title={a.desc}>
              <span className="ach-emoji">{a.emoji}</span>
              <span className="ach-title">{a.title}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="field-hint">Your first badges are one log away.</p>
      )}
      {nextUp.length > 0 && (
        <>
          <div className="section-label ach-next-label">Next up</div>
          {nextUp.map((a) => (
            <div className="ach-next" key={a.key}>
              <span className="ach-emoji small">{a.emoji}</span>
              <div className="ach-next-main">
                <div className="row-between">
                  <span className="ach-next-title">{a.title}</span>
                  <span className="ach-next-pct">{Math.round(a.progress * 100)}%</span>
                </div>
                <div className="ach-meter">
                  <div className="ach-meter-fill" style={{ width: `${Math.max(3, a.progress * 100)}%` }} />
                </div>
                <div className="ach-next-desc">{a.desc}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
