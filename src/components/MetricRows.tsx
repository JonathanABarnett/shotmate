import Sparkline, { type SparkPoint } from "./charts/Sparkline";

export interface MetricDelta {
  text: string;
  className: string;
}

export interface MetricRow {
  key: string;
  label: string;
  current: string;
  unit?: string;
  delta?: MetricDelta;
  points: SparkPoint[];
}

interface Props {
  rows: MetricRow[];
  color: string;
  idPrefix: string;
}

/** Label · sparkline · latest value rows — one small multiple per metric. */
export default function MetricRows({ rows, color, idPrefix }: Props) {
  return (
    <>
      {rows.map((row) => (
        <div className="measure-row" key={row.key}>
          <div className="measure-name">
            {row.label}
            {row.delta && <span className={`measure-delta ${row.delta.className}`}>{row.delta.text}</span>}
          </div>
          <div className="measure-spark">
            <Sparkline points={row.points} height={40} color={color} fillId={`${idPrefix}-${row.key}`} />
          </div>
          <div className="measure-value">
            {row.current}
            {row.unit && <small>{row.unit}</small>}
          </div>
        </div>
      ))}
    </>
  );
}
