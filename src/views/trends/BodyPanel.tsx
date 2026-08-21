import type { AppData, MeasureKey } from "../../types";
import { fmtDayFull } from "../../lib/dates";
import { fmtLength, lengthUnit, MEASURES, measureSeries, sortedMeasures, toDisplayLength } from "../../lib/measures";
import Sparkline from "../../components/charts/Sparkline";
import EmptyState from "../../components/EmptyState";
import ChartStats from "../../components/ChartStats";

const BODY_COLOR = "var(--chart-body)";

interface RowData {
  key: MeasureKey;
  label: string;
  current: string;
  delta?: { text: string; className: string };
  points: { ts: number; value: number }[];
}

function buildRows(data: AppData): RowData[] {
  const unit = data.settings.unit;
  return MEASURES.flatMap(({ key, label }) => {
    const series = measureSeries(data.measures, key);
    if (series.length === 0) return [];
    const current = series.at(-1)!.inches;
    const first = series[0].inches;
    const diff = toDisplayLength(current - first, unit);
    return [
      {
        key,
        label,
        current: fmtLength(current, unit),
        delta:
          series.length >= 2 && Math.abs(diff) >= 0.05
            ? { text: `${diff < 0 ? "↓" : "↑"} ${Math.abs(diff).toFixed(1)}`, className: diff < 0 ? "delta-down" : "delta-up" }
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
          {rows.map((row) => (
            <div className="measure-row" key={row.key}>
              <div className="measure-name">
                {row.label}
                {row.delta && <span className={`measure-delta ${row.delta.className}`}>{row.delta.text}</span>}
              </div>
              <div className="measure-spark">
                <Sparkline points={row.points} height={40} color={BODY_COLOR} fillId={`m-${row.key}`} />
              </div>
              <div className="measure-value">
                {row.current}
                <small>{unit}</small>
              </div>
            </div>
          ))}
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
