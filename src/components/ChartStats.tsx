export interface ChartStat {
  value: string;
  label: string;
}

/** The small figures row under a chart. */
export default function ChartStats({ stats }: { stats: ChartStat[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="chart-stats">
      {stats.map((s) => (
        <div className="chart-stat" key={s.label}>
          <div className="cs-value">{s.value}</div>
          <div className="cs-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
