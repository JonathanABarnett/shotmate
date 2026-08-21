import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { AreaFillDef, CHART } from "./chrome";

export interface SparkPoint {
  ts: number;
  value: number;
}

interface Props {
  points: SparkPoint[];
  height?: number;
  color?: string;
  fillId?: string;
}

/** Tiny axis-free trend line for cards and list rows. */
export default function Sparkline({ points, height = 64, color = CHART.weight, fillId = "spark-fill" }: Props) {
  if (points.length < 2) return null;

  const values = points.map((d) => d.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = Math.max(0.5, (hi - lo) * 0.15);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <AreaFillDef id={fillId} color={color} />
        <YAxis hide domain={[lo - pad, hi + pad]} />
        <XAxis hide dataKey="ts" type="number" domain={["dataMin", "dataMax"]} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          fill={`url(#${fillId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
