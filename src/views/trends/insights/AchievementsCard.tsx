import { useState } from "react";
import type { Achievement } from "../../../lib/achievements";
import { fmtDayFull } from "../../../lib/dates";

const NEXT_UP = 3;

interface Props {
  items: Achievement[];
  /** badge key → when the data first earned it */
  earnedOn: Map<string, number>;
}

export default function AchievementsCard({ items, earnedOn }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const earned = items.filter((a) => a.earned);
  const open = earned.find((a) => a.key === openKey);
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
            {earned.length} of {items.length} unlocked · tap a badge for its story
          </div>
        </div>
      </div>
      {earned.length > 0 ? (
        <div className="ach-grid">
          {earned.map((a) => (
            <button
              className={`ach-badge${a.key === openKey ? " open" : ""}`}
              key={a.key}
              aria-pressed={a.key === openKey}
              onClick={() => setOpenKey((k) => (k === a.key ? null : a.key))}
            >
              <span className="ach-emoji">{a.emoji}</span>
              <span className="ach-title">{a.title}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="field-hint">Your first badges are one log away.</p>
      )}
      {open && (
        <p className="ach-detail">
          <strong>
            {open.emoji} {open.title}
          </strong>{" "}
          — {open.desc}
          {earnedOn.has(open.key) && <> · Earned {fmtDayFull(earnedOn.get(open.key)!)}</>}
        </p>
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
