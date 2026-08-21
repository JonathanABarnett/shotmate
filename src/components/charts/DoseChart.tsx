import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Shot, SiteId } from "../../types";
import { fmtDay } from "../../lib/dates";
import { sortedShots } from "../../lib/shots";
import { siteLabel } from "../../lib/sites";
import { CHART, ChartTip, gridProps, niceTicks, valueAxisProps } from "./chrome";

interface Props {
  shots: Shot[];
  height?: number;
}

export default function DoseChart({ shots, height = 220 }: Props) {
  const data = sortedShots(shots).map((s) => ({ ts: s.ts, value: s.doseMg, site: s.site }));
  if (data.length === 0) return null;
  const hi = Math.ceil(Math.max(...data.map((d) => d.value)) * 1.2);

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }} barCategoryGap="30%">
          <CartesianGrid {...gridProps} />
          <XAxis
            dataKey="ts"
            tickFormatter={(t: number) => fmtDay(t)}
            tick={{ fontSize: 11, fontWeight: 600, fill: CHART.axis, fontFamily: "inherit" }}
            axisLine={false}
            tickLine={false}
            minTickGap={22}
          />
          <YAxis {...valueAxisProps(34)} domain={[0, hi]} ticks={niceTicks(0, hi)} />
          <Tooltip
            content={<ChartTip color={CHART.dose} unitLabel="mg" sub={(p) => siteLabel(p.site as SiteId)} />}
            cursor={{ fill: "rgba(108,79,224,0.07)" }}
            isAnimationActive={false}
          />
          <Bar dataKey="value" fill={CHART.dose} radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
