import { Area, AreaChart, CartesianGrid, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Shot, Unit, WeightEntry } from "../../types";
import { sortedShots } from "../../lib/shots";
import { movingAverage, sortedWeights, toDisplayWeight } from "../../lib/weight";
import { AreaFillDef, CHART, ChartTip, CROSSHAIR, gridProps, niceTicks, referenceLabel, timeAxisProps, tsTicks, valueAxisProps } from "./chrome";

const MAX_DOTS = 45;
const MIN_TREND_POINTS = 5;
/** past this many shots in view, only dose changes get a mark — a year of weekly ticks is noise */
const MAX_SHOT_MARKS = 20;

interface Props {
  weights: WeightEntry[];
  unit: Unit;
  goalLbs?: number;
  /** stretch the y-axis down to the goal line; off = fit to the data so progress is visible */
  includeGoal?: boolean;
  /** shot days drawn as faint ticks, dose changes labeled — the one timeline */
  shots?: Shot[];
  height?: number;
}

interface ShotMark {
  ts: number;
  label?: string;
}

/** Shots inside the chart's date range; the first one in view and every dose change earn a label. */
function shotMarks(shots: Shot[], from: number, to: number): ShotMark[] {
  const sorted = sortedShots(shots);
  const marks = sorted
    .map((s, i): ShotMark => ({ ts: s.ts, label: i === 0 || s.doseMg !== sorted[i - 1].doseMg ? `${s.doseMg} mg` : undefined }))
    .filter((m) => m.ts >= from && m.ts <= to);
  if (marks.length > 0 && !marks[0].label) {
    const first = sorted.find((s) => s.ts === marks[0].ts)!;
    marks[0] = { ...marks[0], label: `${first.doseMg} mg` };
  }
  return marks.length > MAX_SHOT_MARKS ? marks.filter((m) => m.label) : marks;
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

export default function WeightChart({ weights, unit, goalLbs, includeGoal = false, shots = [], height = 240 }: Props) {
  const data = buildData(weights, unit);
  if (data.length === 0) return null;

  const goal = goalLbs != null ? toDisplayWeight(goalLbs, unit) : undefined;
  const domain = valueDomain(data.map((d) => d.value), includeGoal ? goal : undefined);
  const goalVisible = goal != null && goal >= domain[0] && goal <= domain[1];
  const ticks = tsTicks(data[0].ts, data[data.length - 1].ts);
  const showDots = data.length <= MAX_DOTS;
  const marks = shotMarks(shots, data[0].ts, data[data.length - 1].ts);

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
          {marks.map((m) => (
            <ReferenceLine
              key={m.ts}
              x={m.ts}
              stroke={CHART.reference}
              strokeOpacity={0.55}
              strokeDasharray="2 4"
              label={m.label ? referenceLabel(m.label, "insideTopLeft") : undefined}
            />
          ))}
          {goalVisible && (
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
            dot={showDots ? { r: 3, fill: CHART.weight, stroke: CHART.surface, strokeWidth: 2 } : false}
            activeDot={{ r: 5, fill: CHART.weight, stroke: CHART.surface, strokeWidth: 2 }}
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
