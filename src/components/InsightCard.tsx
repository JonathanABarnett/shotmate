import type { ReactNode } from "react";
import ChartStats, { type ChartStat } from "./ChartStats";

export interface InsightBar {
  label: string;
  /** 0..1 fill */
  pct: number;
  display: string;
}

export type InsightTone = "info" | "note" | "warn";

interface Props {
  emoji: string;
  title: string;
  sub?: string;
  /** the one-sentence "so what", rendered as a callout */
  headline?: string;
  tone?: InsightTone;
  stats?: ChartStat[];
  bars?: InsightBar[];
  children?: ReactNode;
}

/** One insight: title, optional bars/stats/custom body, and a headline takeaway. */
export default function InsightCard({ emoji, title, sub, headline, tone = "info", stats, bars, children }: Props) {
  return (
    <section className="card insight-card">
      <div className="insight-head">
        <span className="acc-emoji">{emoji}</span>
        <div>
          <h3 className="card-title">{title}</h3>
          {sub && <div className="card-sub">{sub}</div>}
        </div>
      </div>
      {bars && bars.length > 0 && (
        <div className="insight-bars">
          {bars.map((b) => (
            <div className="freq-row" key={b.label}>
              <span className="freq-name">{b.label}</span>
              <div className="freq-track">
                <div className="freq-fill" style={{ width: `${Math.max(0, Math.min(1, b.pct)) * 100}%`, opacity: b.pct === 0 ? 0 : 1 }} />
              </div>
              <span className="freq-count">{b.display}</span>
            </div>
          ))}
        </div>
      )}
      {children}
      {stats && stats.length > 0 && <ChartStats stats={stats} />}
      {headline && <p className={`callout ${tone} insight-headline`}>{headline}</p>}
    </section>
  );
}
