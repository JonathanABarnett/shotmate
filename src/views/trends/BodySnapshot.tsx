import type { AppData, MeasureKey, Unit } from "../../types";
import { fmtLength, lengthUnit, MEASURES, measureSeries, toDisplayLength } from "../../lib/measures";
import { fmtWeight, latestWeight, startWeightLbs, toDisplayWeight } from "../../lib/weight";
import FigureSilhouette from "../../components/FigureSilhouette";
import { calloutAnchors, figureShape } from "../../lib/figure";

/* The figure is 200 wide; shift it right to leave room for callouts on both sides. */
const FIGURE_SHIFT = 60;
const LEFT_TEXT_X = 86;
const RIGHT_TEXT_X = 234;
const LEADER_GAP = 6;

interface CalloutSpec {
  key: MeasureKey;
  side: "left" | "right";
  y: number;
  anchor: { x: number; y: number };
}

/** Text placement per measure; the anchor dot comes from the body shape. */
const CALLOUT_LAYOUT: Omit<CalloutSpec, "anchor">[] = [
  { key: "chest", side: "left", y: 84 },
  { key: "arm", side: "right", y: 72 },
  { key: "waist", side: "right", y: 112 },
  { key: "stomach", side: "right", y: 152 },
  { key: "hips", side: "left", y: 146 },
  { key: "thigh", side: "left", y: 192 },
];

interface Delta {
  text: string;
  className: string;
}

function deltaOf(changeDisplay: number, digits = 1): Delta | undefined {
  if (Math.abs(changeDisplay) < 0.05) return undefined;
  return {
    text: `${changeDisplay < 0 ? "↓" : "↑"}${Math.abs(changeDisplay).toFixed(digits)}`,
    className: changeDisplay < 0 ? "snap-delta-good" : "snap-delta-bad",
  };
}

interface CalloutProps {
  spec: CalloutSpec;
  label: string;
  value: string;
  delta?: Delta;
}

function Callout({ spec, label, value, delta }: CalloutProps) {
  const left = spec.side === "left";
  const textX = left ? LEFT_TEXT_X : RIGHT_TEXT_X;
  const leaderX = left ? LEFT_TEXT_X + LEADER_GAP : RIGHT_TEXT_X - LEADER_GAP;
  return (
    <g>
      <line className="snap-line" x1={leaderX} y1={spec.y + 4} x2={spec.anchor.x} y2={spec.anchor.y} />
      <circle className="snap-dot" cx={spec.anchor.x} cy={spec.anchor.y} r={3.5} />
      <text x={textX} y={spec.y - 6} textAnchor={left ? "end" : "start"} className="snap-label">
        {label}
      </text>
      <text x={textX} y={spec.y + 11} textAnchor={left ? "end" : "start"} className="snap-value">
        {value}
        {delta && (
          <tspan dx="5" className={delta.className}>
            {delta.text}
          </tspan>
        )}
      </text>
    </g>
  );
}

function measureCallout(data: AppData, spec: CalloutSpec, unit: Unit): CalloutProps | undefined {
  const series = measureSeries(data.measures, spec.key);
  if (series.length === 0) return undefined;
  const latest = series.at(-1)!.inches;
  const change = toDisplayLength(latest - series[0].inches, unit);
  return {
    spec,
    label: MEASURES.find((m) => m.key === spec.key)!.label,
    value: fmtLength(latest, unit),
    delta: series.length >= 2 ? deltaOf(change) : undefined,
  };
}

/** Your numbers, drawn on the body they belong to. */
export default function BodySnapshot({ data }: { data: AppData }) {
  const unit = data.settings.unit;
  const anchors = calloutAnchors(figureShape(data.settings.bodyType));
  const specs: CalloutSpec[] = CALLOUT_LAYOUT.map((c) => ({ ...c, anchor: { x: anchors[c.key].x + FIGURE_SHIFT, y: anchors[c.key].y } }));
  const callouts = specs.map((c) => measureCallout(data, c, unit)).filter((c): c is CalloutProps => !!c);
  const weight = latestWeight(data.weights);
  if (callouts.length === 0 && !weight) return null;

  const start = startWeightLbs(data);
  const weightDelta = weight && start != null ? deltaOf(toDisplayWeight(weight.lbs - start, unit)) : undefined;
  const missing = MEASURES.filter((m) => !callouts.some((c) => c.spec.key === m.key)).map((m) => m.label.toLowerCase());

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Body snapshot</h3>
          <div className="card-sub">
            {callouts.length > 0
              ? `Latest check-ins in ${lengthUnit(unit) === "in" ? "inches" : "cm"} · change since your first`
              : "Log a tape check-in to fill this in"}
          </div>
        </div>
      </div>
      <svg className="snapshot-svg" viewBox="0 -34 320 290" role="img" aria-label="Body snapshot with current measurements">
        {weight && (
          <text x={160 + FIGURE_SHIFT - 60} y="-10" textAnchor="middle" className="snap-weight">
            {fmtWeight(weight.lbs, unit)}
            {weightDelta && (
              <tspan dx="6" className={weightDelta.className}>
                {weightDelta.text}
              </tspan>
            )}
          </text>
        )}
        <g transform={`translate(${FIGURE_SHIFT} 0)`}>
          <FigureSilhouette bodyType={data.settings.bodyType} />
        </g>
        {callouts.map((c) => (
          <Callout key={c.spec.key} {...c} />
        ))}
      </svg>
      {missing.length > 0 && callouts.length > 0 && (
        <p className="field-hint snap-hint">Add {missing.join(", ")} for the full picture.</p>
      )}
    </section>
  );
}
