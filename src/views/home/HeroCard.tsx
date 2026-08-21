import { Syringe } from "lucide-react";
import type { AppData } from "../../types";
import { fmtDayFull } from "../../lib/dates";
import { medFor } from "../../lib/meds";
import { cycleProgress, dueInfo, nextDueTs, type DueInfo } from "../../lib/shots";
import ProgressRing from "../../components/ProgressRing";

interface Props {
  data: AppData;
  onLogShot: () => void;
}

function RingContent({ due }: { due: DueInfo }) {
  if (due.state === "today") {
    return (
      <>
        <div className="ring-big">💉</div>
        <div className="ring-small">shot day!</div>
      </>
    );
  }
  if (due.state === "overdue") {
    return (
      <>
        <div className="ring-big">{Math.abs(due.days)}</div>
        <div className="ring-small">{Math.abs(due.days) === 1 ? "day late" : "days late"}</div>
      </>
    );
  }
  return (
    <>
      <div className="ring-big">{due.days}</div>
      <div className="ring-small">{due.days === 1 ? "day left" : "days left"}</div>
    </>
  );
}

function FirstShotHero({ medName, onLogShot }: { medName: string; onLogShot: () => void }) {
  return (
    <section className="hero">
      <div className="hero-top">
        <div>
          <div className="hero-label">✨ Welcome to ShotMate</div>
          <h2 className="hero-med">{medName}</h2>
          <p className="hero-when">Log your first shot to start the countdown.</p>
        </div>
        <ProgressRing progress={0}>
          <div className="ring-big">💜</div>
        </ProgressRing>
      </div>
      <div className="hero-cta">
        <button className="btn-on-grad" onClick={onLogShot}>
          <Syringe size={17} /> Log first shot
        </button>
      </div>
    </section>
  );
}

export default function HeroCard({ data, onLogShot }: Props) {
  const med = medFor(data.settings);
  const dueTs = nextDueTs(data.shots, data.settings.scheduleDays);

  if (dueTs == null) return <FirstShotHero medName={med.brand} onLogShot={onLogShot} />;

  const due = dueInfo(dueTs);
  const progress = cycleProgress(data.shots, data.settings.scheduleDays);
  const doseText = `${data.settings.plannedDoseMg} mg`;

  return (
    <section className="hero">
      <div className="hero-top">
        <div>
          <div className="hero-label">
            <Syringe size={14} /> NEXT SHOT
          </div>
          <h2 className="hero-med">
            {med.brand} · {doseText}
          </h2>
          <p className="hero-when">
            {due.state === "today" ? (
              <>
                Due <strong>today</strong> — you've got this!
              </>
            ) : due.state === "overdue" ? (
              <>
                Was due <strong>{fmtDayFull(dueTs)}</strong> · {due.text}
              </>
            ) : (
              <>
                <strong>{fmtDayFull(dueTs)}</strong> · {due.text}
              </>
            )}
          </p>
        </div>
        <ProgressRing progress={progress}>
          <RingContent due={due} />
        </ProgressRing>
      </div>
      <div className="hero-cta">
        <button className="btn-on-grad" onClick={onLogShot}>
          <Syringe size={17} /> Log shot
        </button>
      </div>
    </section>
  );
}
