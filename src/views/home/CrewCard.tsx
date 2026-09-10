import { useMemo, useState } from "react";
import type { AppData } from "../../types";
import { crewFeed } from "../../lib/crew";
import { fmtDayFull, fmtTime, startOfDay } from "../../lib/dates";
import CrewAvatar from "../../components/CrewAvatar";

const PREVIEW = 4;
const EXPANDED = 12;

const when = (ts: number) => (startOfDay(ts) === startOfDay(Date.now()) ? `Today · ${fmtTime(ts)}` : fmtDayFull(ts));

/** The crew's feed: their reactions to your moments and their own updates, newest first. */
export default function CrewCard({ data }: { data: AppData }) {
  const feed = useMemo(() => crewFeed(data), [data]);
  const [expanded, setExpanded] = useState(false);
  const shown = feed.slice(0, expanded ? EXPANDED : PREVIEW);

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Your crew</h3>
          <div className="card-sub">A cast of characters who live in this app — they only ever see what's on this phone</div>
        </div>
      </div>
      {feed.length === 0 ? (
        <p className="field-hint">They'll pipe up once your first moment lands.</p>
      ) : (
        <div className="crew-list">
          {shown.map((c) => (
            <div className="crew-item" key={c.key}>
              <CrewAvatar member={c.member} />
              <div className="crew-main">
                <div className="crew-meta">
                  <span className="crew-name">{c.member.name}</span> · {when(c.ts)}
                  {c.about && <span className="crew-about"> · on “{c.about}”</span>}
                </div>
                <div className="crew-text">{c.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {feed.length > PREVIEW && (
        <button className="link-btn moment-more" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show fewer" : "Show more"}
        </button>
      )}
    </section>
  );
}