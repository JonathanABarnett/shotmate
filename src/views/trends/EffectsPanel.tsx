import type { AppData } from "../../types";
import { fmtDayFull } from "../../lib/dates";
import { effectTimingBuckets, effectTimingSummary } from "../../lib/insights";
import EmptyState from "../../components/EmptyState";
import ChartStats from "./ChartStats";

interface EffectCount {
  name: string;
  count: number;
}

function countEffects(data: AppData): EffectCount[] {
  const counts = new Map<string, number>();
  for (const entry of data.effects) {
    for (const name of entry.effects) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function TimingInsight({ data }: { data: AppData }) {
  const buckets = effectTimingBuckets(data);
  const summary = effectTimingSummary(buckets);
  if (!summary) return null;
  const max = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">When they hit</h3>
          <div className="card-sub">Side-effect entries by days since your shot</div>
        </div>
      </div>
      <div className="spacer-8" />
      {buckets.map((b) => (
        <div className="freq-row" key={b.offsetDays}>
          <span className="freq-name">{b.label}</span>
          <div className="freq-track">
            <div className="freq-fill" style={{ width: `${(b.count / max) * 100}%`, opacity: b.count === 0 ? 0 : 1 }} />
          </div>
          <span className="freq-count">{b.count}</span>
        </div>
      ))}
      <div className="spacer-8" />
      <p className="callout info">💡 {summary}</p>
    </section>
  );
}

export default function EffectsPanel({ data }: { data: AppData }) {
  const counts = countEffects(data);
  const latest = [...data.effects].sort((a, b) => b.ts - a.ts)[0];

  return (
    <>
      <section className="card">
        <div className="card-title-row">
          <div>
            <h3 className="card-title">How you've felt</h3>
            <div className="card-sub">Times each symptom came up</div>
          </div>
        </div>
        {counts.length > 0 ? (
          <>
            <div className="spacer-8" />
            {counts.map((c) => (
              <div className="freq-row" key={c.name}>
                <span className="freq-name">{c.name}</span>
                <div className="freq-track">
                  <div className="freq-fill" style={{ width: `${(c.count / counts[0].count) * 100}%` }} />
                </div>
                <span className="freq-count">{c.count}</span>
              </div>
            ))}
            <ChartStats
              stats={[
                { value: `${data.effects.length}`, label: "entries" },
                { value: counts[0].name, label: "most frequent" },
                ...(latest ? [{ value: fmtDayFull(latest.ts), label: "last entry" }] : []),
              ]}
            />
          </>
        ) : (
          <EmptyState
            emoji="🌈"
            title="Nothing logged — that's great!"
            sub="If a side effect shows up, log it here to spot patterns around shot days."
          />
        )}
      </section>
      <TimingInsight data={data} />
    </>
  );
}
