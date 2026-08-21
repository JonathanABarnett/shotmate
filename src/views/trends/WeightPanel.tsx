import { useState } from "react";
import type { AppData } from "../../types";
import { DAY } from "../../lib/dates";
import { bmi, latestWeight, sortedWeights, toDisplayWeight, weeklyRate } from "../../lib/weight";
import WeightChart from "../../components/charts/WeightChart";
import EmptyState from "../../components/EmptyState";
import ChartStats, { type ChartStat } from "../../components/ChartStats";
import RangeChips from "./RangeChips";

type RangeKey = "30" | "90" | "180" | "all";

const RANGES = [
  { key: "30", label: "1M" },
  { key: "90", label: "3M" },
  { key: "180", label: "6M" },
  { key: "all", label: "All" },
] as const;

function buildStats(data: AppData, rangeDays: number | null): ChartStat[] {
  const { unit, heightIn } = data.settings;
  const sorted = sortedWeights(data.weights);
  const inRange = rangeDays ? sorted.filter((w) => w.ts >= Date.now() - rangeDays * DAY) : sorted;
  if (inRange.length < 2) return [];

  const change = inRange.at(-1)!.lbs - inRange[0].lbs;
  const stats: ChartStat[] = [
    {
      value: `${change <= 0 ? "" : "+"}${toDisplayWeight(change, unit).toFixed(1)} ${unit}`,
      label: "change in range",
    },
  ];
  const rate = weeklyRate(data.weights);
  if (rate != null) {
    stats.push({ value: `${rate <= 0 ? "" : "+"}${toDisplayWeight(rate, unit).toFixed(1)} ${unit}/wk`, label: "recent pace" });
  }
  const currentBmi = bmi(latestWeight(data.weights)!.lbs, heightIn);
  if (currentBmi != null) {
    stats.push({ value: currentBmi.toFixed(1), label: "BMI" });
  }
  return stats;
}

export default function WeightPanel({ data }: { data: AppData }) {
  const [range, setRange] = useState<RangeKey>("90");
  const rangeDays = range === "all" ? null : Number(range);
  const weights = rangeDays ? data.weights.filter((w) => w.ts >= Date.now() - rangeDays * DAY) : data.weights;

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Weight</h3>
          <div className="card-sub">Dots are weigh-ins · soft line is your 7-day average</div>
        </div>
      </div>
      <div className="spacer-8" />
      <RangeChips options={RANGES.map((r) => ({ key: r.key as RangeKey, label: r.label }))} value={range} onChange={setRange} />
      {weights.length >= 2 ? (
        <>
          <WeightChart weights={weights} unit={data.settings.unit} goalLbs={data.settings.goalLbs} />
          <ChartStats stats={buildStats(data, rangeDays)} />
        </>
      ) : (
        <EmptyState
          emoji="⚖️"
          title="Not much here yet"
          sub="Log a couple of weigh-ins and your trend will bloom into a chart."
        />
      )}
    </section>
  );
}
