import type { AppData } from "../../types";
import { fmtDayFull } from "../../lib/dates";
import { medFor } from "../../lib/meds";
import { levelAt } from "../../lib/pk";
import { nextDueTs } from "../../lib/shots";
import LevelChart from "../../components/charts/LevelChart";
import EmptyState from "../../components/EmptyState";
import ChartStats from "./ChartStats";

export default function LevelPanel({ data }: { data: AppData }) {
  const med = medFor(data.settings);
  const hasShots = data.shots.length > 0;
  const dueTs = nextDueTs(data.shots, data.settings.scheduleDays);

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Medication in your system</h3>
          <div className="card-sub">Estimated from your logged shots · dashed = projected</div>
        </div>
      </div>
      {hasShots ? (
        <>
          <LevelChart
            shots={data.shots}
            halfLifeH={med.halfLifeH}
            scheduleDays={data.settings.scheduleDays}
            rangeDays={45}
          />
          <ChartStats
            stats={[
              { value: `${levelAt(Date.now(), data.shots, med.halfLifeH).toFixed(1)} mg`, label: "est. right now" },
              { value: `${(med.halfLifeH / 24).toFixed(0)} days`, label: `${med.brand} half-life` },
              ...(dueTs ? [{ value: fmtDayFull(dueTs), label: "next shot" }] : []),
            ]}
          />
          <div className="spacer-16" />
          <p className="callout info">
            💡 A simple model of how {med.brand} builds up and fades between shots — handy for spotting why the
            day-before-shot feels different. It's an estimate, not a lab value.
          </p>
        </>
      ) : (
        <EmptyState emoji="💧" title="No shots logged yet" sub="Once you log shots, you'll see how levels build and fade between doses." />
      )}
    </section>
  );
}
