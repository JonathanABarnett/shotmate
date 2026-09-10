import { useState } from "react";
import type { Moment, MomentKind } from "../../../lib/moments";
import { crewComments, crewReactions } from "../../../lib/crew";
import { fmtDayFull } from "../../../lib/dates";
import CrewAvatar from "../../../components/CrewAvatar";

const PREVIEW = 8;

const KIND_LABEL: Record<MomentKind, string> = {
  badge: "Badge",
  milestone: "Milestone",
  record: "Personal record",
  win: "Win",
  tape: "Tape milestone",
};

/** emoji → how many of the crew used it */
function tally(reactions: { emoji: string }[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const r of reactions) counts.set(r.emoji, (counts.get(r.emoji) ?? 0) + 1);
  return [...counts.entries()];
}

function MomentRow({ moment, open, onToggle }: { moment: Moment; open: boolean; onToggle: () => void }) {
  const reactions = crewReactions(moment);
  const thread = crewComments(moment).filter((c) => c.ts <= Date.now());
  return (
    <div className="moment-row-wrap">
      <button className="moment-row" aria-expanded={open} onClick={onToggle}>
        <span className="ach-emoji small">{moment.emoji}</span>
        <div className="moment-main">
          <div className="moment-title">{moment.title}</div>
          <div className="moment-sub">
            {KIND_LABEL[moment.kind]} · {fmtDayFull(moment.ts)}
          </div>
          <div className="moment-reacts">
            {tally(reactions).map(([emoji, n]) => (
              <span className="react-pill" key={emoji}>
                {emoji} {n}
              </span>
            ))}
          </div>
        </div>
      </button>
      {open && (
        <div className="crew-thread">
          <div className="crew-who">{reactions.map((r) => `${r.emoji} ${r.member.name}`).join("  ·  ")}</div>
          {thread.map((c) => (
            <div className="crew-comment" key={c.key}>
              <CrewAvatar member={c.member} size={24} />
              <div>
                <span className="crew-name">{c.member.name}</span> <span className="crew-text">{c.text}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** The trophy room: every badge, milestone, record, and win, with the day it happened and the crew's take. */
export default function MomentsCard({ feed }: { feed: Moment[] }) {
  const [showAll, setShowAll] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const shown = showAll ? feed : feed.slice(0, PREVIEW);

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Moments</h3>
          <div className="card-sub">Every badge, milestone, record, and win — tap one to see who chimed in</div>
        </div>
      </div>
      {feed.length === 0 ? (
        <p className="field-hint">Your first moment lands with your first badge.</p>
      ) : (
        <div className="moment-list">
          {shown.map((m) => (
            <MomentRow key={m.key} moment={m} open={openKey === m.key} onToggle={() => setOpenKey((k) => (k === m.key ? null : m.key))} />
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