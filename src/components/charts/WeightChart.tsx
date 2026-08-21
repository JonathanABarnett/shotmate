import { Area, AreaChart, CartesianGrid, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Unit, WeightEntry } from "../../types";
import { movingAverage, sortedWeights, toDisplayWeight } from "../../lib/weight";
import { AreaFillDef, CHART, ChartTip, CROSSHAIR, gridProps, niceTicks, referenceLabel, timeAxisProps, tsTicks, valueAxisProps } from "./chrome";

const MAX_DOTS = 45;
const MIN_TREND_POINTS = 5;

interface Props {
  weights: WeightEntry[];
  unit: Unit;
  goalLbs?: number;
  height?: number;
}

function buildData(weights: WeightEntry[], unit: Unit) {
  const sorted = sortedWeights(weights);
  const avg = movingAverage(sorted);
  return sorted.map((w, i) => ({
    ts: w.ts,
    value: toDisplayWeight(w.lbs, unit),
    trend: toDisplayWeight(avg[i].lbs, unit),
  }));
}

function valueDomain(values: number[], goal?: number): [number, number] {
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (goal != null) {
    lo = Math.min(lo, goal);
    hi = Math.max(hi, goal);
  }
  const pad = Math.max(2, (hi - lo) * 0.12);
  return [Math.floor(lo - pad), Math.ceil(hi + pad)];
}

export default function WeightChart({ weights, unit, goalLbs, height = 240 }: Props) {
  const data = buildData(weights, unit);
  if (data.length === 0) return null;

  const goal = goalLbs != null ? toDisplayWeight(goalLbs, unit) : undefined;
  const domain = valueDomain(data.map((d) => d.value), goal);
  const ticks = tsTicks(data[0].ts, data[data.length - 1].ts);
  const showDots = data.length <= MAX_DOTS;

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <AreaFillDef id="weight-fill" color={CHART.weight} />
          <CartesianGrid {...gridProps} />
          <XAxis {...timeAxisProps(ticks)} />
          <YAxis
            {...valueAxisProps(40)}
            domain={domain}
            ticks={niceTicks(domain[0], domain[1])}
            tickFormatter={(v: number) => `${Math.round(v)}`}
          />
          {goal != null && (
            <ReferenceLine
              y={goal}
              stroke={CHART.reference}
              strokeDasharray="6 5"
              strokeWidth={1.5}
              label={referenceLabel(`Goal ${Math.round(goal)}`, "insideBottomRight")}
            />
          )}
          <Tooltip content={<ChartTip color={CHART.weight} unitLabel={unit} />} cursor={CROSSHAIR} isAnimationActive={false} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART.weight}
            strokeWidth={2}
            strokeLinecap="round"
            fill="url(#weight-fill)"
            dot={showDots ? { r: 3, fill: CHART.weight, stroke: "#fff", strokeWidth: 2 } : false}
            activeDot={{ r: 5, fill: CHART.weight, stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
          {data.length >= MIN_TREND_POINTS && (
            <Line
              type="monotone"
              dataKey="trend"
              stroke={CHART.weight}
              strokeOpacity={0.35}
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
