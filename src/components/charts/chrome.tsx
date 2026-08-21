import { fmtDay, fmtDayFull, fmtTime } from "../../lib/dates";

/**
 * Chart palette — CSS custom properties so light/dark both resolve to steps
 * validated ≥3:1 against their surface (dataviz method; see styles/tokens.css).
 */
export const CHART = {
  weight: "var(--chart-weight)",
  level: "var(--chart-level)",
  dose: "var(--chart-weight)",
  effect: "var(--chart-effect)",
  body: "var(--chart-body)",
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
  reference: "var(--chart-ref)",
  surface: "var(--surface)",
  barHover: "var(--chart-bar-hover)",
} as const;

const AXIS_TICK = { fontSize: 11, fontWeight: 600, fill: CHART.axis, fontFamily: "inherit" } as const;

export const CROSSHAIR = { stroke: "var(--chart-cursor)", strokeWidth: 1 } as const;

export const gridProps = { vertical: false, stroke: CHART.grid, strokeWidth: 1 } as const;

/** Evenly spaced timestamp ticks across a range. */
export function tsTicks(min: number, max: number, count = 4): number[] {
  if (max <= min) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}

function niceStep(rough: number): number {
  const pow = 10 ** Math.floor(Math.log10(rough));
  const r = rough / pow;
  const multiplier = r >= 7.5 ? 10 : r >= 3.5 ? 5 : r >= 1.5 ? 2 : 1;
  return multiplier * pow;
}

/** Clean, round-number value ticks inside [min, max]. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (max <= min) return [min];
  const step = niceStep((max - min) / (count - 1));
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) {
    ticks.push(Math.round(v * 100) / 100);
  }
  return ticks;
}

/** Numeric time x-axis, shared by every time-series chart. */
export function timeAxisProps(ticks: number[]) {
  return {
    dataKey: "ts",
    type: "number" as const,
    domain: ["dataMin", "dataMax"] as [string, string],
    ticks,
    tickFormatter: (t: number) => fmtDay(t),
    tick: AXIS_TICK,
    axisLine: false,
    tickLine: false,
    minTickGap: 24,
  };
}

/** Recessive value y-axis, shared by every chart. */
export function valueAxisProps(width = 38) {
  return {
    tick: AXIS_TICK,
    axisLine: false,
    tickLine: false,
    width,
  };
}

type ReferenceLabelPosition = "insideTopLeft" | "insideTopRight" | "insideBottomRight";

export function referenceLabel(value: string, position: ReferenceLabelPosition) {
  return { value, position, fill: CHART.axis, fontSize: 11, fontWeight: 700 };
}

/* --------------------------------- tooltip --------------------------------- */

interface TipPayload {
  value: number | null;
  payload: Record<string, unknown>;
}

export interface ChartTipProps {
  active?: boolean;
  payload?: TipPayload[];
  color: string;
  unitLabel: string;
  digits?: number;
  /** hide the time — for buckets (weeks, days) where a clock time is noise */
  dateOnly?: boolean;
  sub?: (point: Record<string, unknown>) => string | undefined;
}

/** The one tooltip every chart uses: date line, keyed value, optional context. */
export function ChartTip({ active, payload, color, unitLabel, sub, digits = 1, dateOnly }: ChartTipProps) {
  if (!active || !payload?.length) return null;
  const point = payload.find((p) => p.value != null) ?? payload[0];
  if (point.value == null) return null;
  const ts = point.payload.ts as number;
  const subText = sub?.(point.payload);
  return (
    <div className="chart-tip">
      <div className="tip-date">
        {fmtDayFull(ts)}
        {!dateOnly && ` · ${fmtTime(ts)}`}
      </div>
      <div className="tip-value">
        <span className="tip-key" style={{ background: color }} />
        {Number(point.value).toFixed(digits)} {unitLabel}
      </div>
      {subText && <div className="tip-sub">{subText}</div>}
    </div>
  );
}

/** Gradient area fill definition, one per chart hue. */
export function AreaFillDef({ id, color }: { id: string; color: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={0.22} />
        <stop offset="100%" stopColor={color} stopOpacity={0.01} />
      </linearGradient>
    </defs>
  );
}
