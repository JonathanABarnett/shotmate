import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { Unit, WeightEntry } from "../../types";
import { sortedWeights, toDisplayWeight } from "../../lib/weight";
import { AreaFillDef, CHART } from "./chrome";

const POINTS = 30;

interface Props {
  weights: WeightEntry[];
  unit: Unit;
}

/** Tiny axis-free trend for the home card. */
export default function Sparkline({ weights, unit }: Props) {
  const data = sortedWeights(weights)
    .slice(-POINTS)
    .map((w) => ({ ts: w.ts, value: toDisplayWeight(w.lbs, unit) }));
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = Math.max(1, (hi - lo) * 0.15);

  return (
    <ResponsiveContainer width="100%" height={64}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <AreaFillDef id="spark-fill" color={CHART.weight} />
        <YAxis hide domain={[lo - pad, hi + pad]} />
        <XAxis hide dataKey="ts" type="number" domain={["dataMin", "dataMax"]} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={CHART.weight}
          strokeWidth={2}
          strokeLinecap="round"
          fill="url(#spark-fill)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
