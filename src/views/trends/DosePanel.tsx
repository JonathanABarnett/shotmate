import type { AppData } from "../../types";
import { sortedShots } from "../../lib/shots";
import DoseChart from "../../components/charts/DoseChart";
import EmptyState from "../../components/EmptyState";
import ChartStats from "./ChartStats";

function weeksOnCurrentDose(data: AppData): number {
  const sorted = sortedShots(data.shots);
  if (sorted.length === 0) return 0;
  const current = sorted.at(-1)!.doseMg;
  let count = 0;
  for (let i = sorted.length - 1; i >= 0 && sorted[i].doseMg === current; i--) count++;
  return count;
}

export default function DosePanel({ data }: { data: AppData }) {
  const hasShots = data.shots.length > 0;
  const currentDose = sortedShots(data.shots).at(-1)?.doseMg;

  return (
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
  );
}
