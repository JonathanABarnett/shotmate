import type { AppData } from "../../types";
import { fmtDayFull } from "../../lib/dates";
import { fmtLength, lengthUnit, MEASURES, measureSeries, sortedMeasures, toDisplayLength } from "../../lib/measures";
import MetricRows, { type MetricRow } from "../../components/MetricRows";
import EmptyState from "../../components/EmptyState";
import ChartStats from "../../components/ChartStats";

const BODY_COLOR = "var(--chart-body)";

function buildRows(data: AppData): MetricRow[] {
  const unit = data.settings.unit;
  return MEASURES.flatMap(({ key, label }) => {
    const series = measureSeries(data.measures, key);
    if (series.length === 0) return [];
    const current = series.at(-1)!.inches;
    const diff = toDisplayLength(current - series[0].inches, unit);
    return [
      {
        key,
        label,
        current: fmtLength(current, unit),
        unit: lengthUnit(unit),
        delta:
          series.length >= 2 && Math.abs(diff) >= 0.05
            ? { text: `${diff < 0 ? "↓" : "↑"} ${Math.abs(diff).toFixed(1)}`, className: diff < 0 ? "delta-good" : "delta-bad" }
            : undefined,
        points: series.map((p) => ({ ts: p.ts, value: toDisplayLength(p.inches, unit) })),
      },
    ];
  });
}

export default function BodyPanel({ data }: { data: AppData }) {
  const rows = buildRows(data);
  const unit = lengthUnit(data.settings.unit);
  const latest = sortedMeasures(data.measures).at(-1);

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Body measurements</h3>
          <div className="card-sub">Change since your first check-in · {unit === "in" ? "inches" : "centimeters"}</div>
        </div>
      </div>
      {rows.length > 0 ? (
        <>
          <div className="spacer-8" />
          <MetricRows rows={rows} color={BODY_COLOR} idPrefix="m" />
          <ChartStats
            stats={[
              { value: `${data.measures.length}`, label: "check-ins" },
              ...(latest ? [{ value: fmtDayFull(latest.ts), label: "last measured" }] : []),
            ]}
          />
        </>
      ) : (
        <EmptyState
          emoji="📏"
          title="Grab a tape measure"
          sub="Chest and waist often change before the scale does. Log a check-in from the + button."
        />
      )}
    </section>
  );
}
