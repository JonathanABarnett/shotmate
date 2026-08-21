import type { AppData } from "../../types";
import { fmtDayFull } from "../../lib/dates";
import { fmtVital, isImprovement, sortedVitals, VITALS, vitalSeries } from "../../lib/vitals";
import MetricRows, { type MetricRow } from "../../components/MetricRows";
import EmptyState from "../../components/EmptyState";
import ChartStats from "../../components/ChartStats";

const VITALS_COLOR = "var(--chart-vitals)";

function buildRows(data: AppData): MetricRow[] {
  return VITALS.flatMap((v) => {
    const series = vitalSeries(data.vitals, v.key);
    if (series.length === 0) return [];
    const current = series.at(-1)!.value;
    const diff = current - series[0].value;
    return [
      {
        key: v.key,
        label: v.label,
        current: fmtVital(v.key, current),
        delta:
          series.length >= 2 && Math.abs(diff) >= 0.05
            ? { text: `${diff < 0 ? "↓" : "↑"} ${Math.abs(diff).toFixed(v.decimals)}`, className: isImprovement(v.key, diff) ? "delta-good" : "delta-bad" }
            : undefined,
        points: series,
      },
    ];
  });
}

export default function VitalsPanel({ data }: { data: AppData }) {
  const rows = buildRows(data);
  const latest = sortedVitals(data.vitals).at(-1);

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Labs & vitals</h3>
          <div className="card-sub">Change since your first entry · green means moving the right way</div>
        </div>
      </div>
      {rows.length > 0 ? (
        <>
          <div className="spacer-8" />
          <MetricRows rows={rows} color={VITALS_COLOR} idPrefix="v" />
          <ChartStats
            stats={[
              { value: `${data.vitals.length}`, label: "check-ins" },
              ...(latest ? [{ value: fmtDayFull(latest.ts), label: "last entry" }] : []),
            ]}
          />
          <p className="field-hint">These flow into your provider report automatically.</p>
        </>
      ) : (
        <EmptyState
          emoji="🩺"
          title="Bring your numbers along"
          sub="Blood pressure, resting heart rate, A1c, lipids — log them from the + button and watch them move with the weight."
        />
      )}
    </section>
  );
}
