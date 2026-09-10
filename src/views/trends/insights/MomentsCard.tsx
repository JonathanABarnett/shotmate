import { useState } from "react";
import type { Moment, MomentKind } from "../../../lib/moments";
import { fmtDayFull } from "../../../lib/dates";

const PREVIEW = 8;

const KIND_LABEL: Record<MomentKind, string> = {
  badge: "Badge",
  milestone: "Milestone",
  record: "Personal record",
  win: "Win",
};

/** The trophy room: every badge, milestone, record, and win, with the day it happened. */
export default function MomentsCard({ feed }: { feed: Moment[] }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? feed : feed.slice(0, PREVIEW);

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Moments</h3>
          <div className="card-sub">Every badge, milestone, record, and win — and the day it happened</div>
        </div>
      </div>
      {feed.length === 0 ? (
        <p className="field-hint">Your first moment lands with your first badge.</p>
      ) : (
        <div className="moment-list">
          {shown.map((m) => (
            <div className="moment-row" key={m.key}>
              <span className="ach-emoji small">{m.emoji}</span>
              <div className="moment-main">
                <div className="moment-title">{m.title}</div>
                <div className="moment-sub">
                  {KIND_LABEL[m.kind]} · {fmtDayFull(m.ts)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {feed.length > PREVIEW && (
        <button className="link-btn moment-more" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Show fewer" : `Show all ${feed.length}`}
        </button>
      )}
    </section>
  );
}
