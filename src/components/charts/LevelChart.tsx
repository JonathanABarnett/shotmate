import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Shot } from "../../types";
import { DAY } from "../../lib/dates";
import { levelSeries } from "../../lib/pk";
import { AreaFillDef, CHART, ChartTip, CROSSHAIR, gridProps, niceTicks, referenceLabel, timeAxisProps, tsTicks, valueAxisProps } from "./chrome";

interface Props {
  shots: Shot[];
  halfLifeH: number;
  scheduleDays: number;
  rangeDays?: number;
  height?: number;
}

const seriesStyle = {
  type: "monotone",
  stroke: CHART.level,
  strokeWidth: 2,
  strokeLinecap: "round",
  dot: false,
  activeDot: { r: 5, fill: CHART.level, stroke: "#fff", strokeWidth: 2 },
  isAnimationActive: false,
} as const;

export default function LevelChart({ shots, halfLifeH, scheduleDays, rangeDays, height = 240 }: Props) {
  const now = Date.now();
  let data = levelSeries(shots, halfLifeH, scheduleDays, now);
  if (rangeDays) data = data.filter((d) => d.ts >= now - rangeDays * DAY);
  if (data.length === 0) return null;

  const hi = Math.ceil(Math.max(...data.map((d) => d.past ?? d.future ?? 0), 0.1) * 1.15 * 10) / 10;
  const ticks = tsTicks(data[0].ts, data[data.length - 1].ts);
  const isProjected = (point: Record<string, unknown>) =>
    point.future != null && point.past == null ? "Projected" : undefined;

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <AreaFillDef id="level-fill" color={CHART.level} />
          <CartesianGrid {...gridProps} />
          <XAxis {...timeAxisProps(ticks)} />
          <YAxis {...valueAxisProps(34)} domain={[0, hi]} ticks={niceTicks(0, hi)} />
          <ReferenceLine x={now} stroke={CHART.reference} strokeWidth={1.5} label={referenceLabel("Now", "insideTopLeft")} />
          <Tooltip
            content={<ChartTip color={CHART.level} unitLabel="mg est." sub={isProjected} />}
            cursor={CROSSHAIR}
            isAnimationActive={false}
          />
          <Area {...seriesStyle} dataKey="past" fill="url(#level-fill)" />
          <Area {...seriesStyle} dataKey="future" strokeDasharray="5 5" fill="none" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
