import type { AppData } from "../../types";
import { paceByDose } from "../../lib/insights";
import { sortedShots } from "../../lib/shots";
import { toDisplayWeight } from "../../lib/weight";
import DoseChart from "../../components/charts/DoseChart";
import EmptyState from "../../components/EmptyState";
import ChartStats from "../../components/ChartStats";

function weeksOnCurrentDose(data: AppData): number {
  const sorted = sortedShots(data.shots);
  if (sorted.length === 0) return 0;
  const current = sorted.at(-1)!.doseMg;
  let count = 0;
  for (let i = sorted.length - 1; i >= 0 && sorted[i].doseMg === current; i--) count++;
  return count;
}

function PaceInsight({ data }: { data: AppData }) {
  const paces = paceByDose(data);
  if (paces.length === 0) return null;
  const unit = data.settings.unit;

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Pace at each dose</h3>
          <div className="card-sub">Average weekly change while you held a dose</div>
        </div>
      </div>
      <div className="spacer-8" />
      {paces.map((p) => {
        const rate = toDisplayWeight(p.lbsPerWeek, unit);
        return (
          <div className="pace-row" key={`${p.doseMg}-${p.weeks}`}>
            <span className="pace-dose">{p.doseMg} mg</span>
            <span className={`pace-rate ${rate <= 0 ? "delta-down" : "delta-up"}`}>
              {rate <= 0 ? "" : "+"}
              {rate.toFixed(1)} {unit}/wk
            </span>
            <span className="pace-weeks">{p.weeks} wks</span>
          </div>
        );
      })}
      <p className="field-hint">Doses held at least two weeks, with enough weigh-ins to trust the math.</p>
    </section>
  );
}

export default function DosePanel({ data }: { data: AppData }) {
  const hasShots = data.shots.length > 0;
  const currentDose = sortedShots(data.shots).at(-1)?.doseMg;

  return (
    <>
      <section className="card">
        <div className="card-title-row">
          <div>
            <h3 className="card-title">Dose history</h3>
            <div className="card-sub">Your titration journey, shot by shot</div>
          </div>
        </div>
        {hasShots ? (
          <>
            <DoseChart shots={data.shots} />
            <ChartStats
              stats={[
                { value: `${data.shots.length}`, label: "shots logged" },
                ...(currentDose != null ? [{ value: `${currentDose} mg`, label: "current dose" }] : []),
                { value: `${weeksOnCurrentDose(data)}`, label: "shots at this dose" },
              ]}
            />
          </>
        ) : (
          <EmptyState emoji="💉" title="No shots logged yet" sub="Your dose steps will chart here as you log shots." />
        )}
      </section>
      <PaceInsight data={data} />
    </>
  );
}
