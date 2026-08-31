import type { Unit } from "../../../types";
import { fmtDay } from "../../../lib/dates";
import type { FuelCheck, GoalOutlook, PaceShift, ShotDayBump, TapeVsScale, TrendCheck } from "../../../lib/insights";
import InsightCard from "../../../components/InsightCard";
import { absWeight, signedLength, signedWeight, weeklyRateText } from "../../../lib/format";

interface WithUnit {
  unit: Unit;
}

export function OutlookCard({ outlook, unit, goalLbs }: WithUnit & { outlook: GoalOutlook; goalLbs?: number }) {
  const eta = outlook.etaMilestoneTs ? `, around ${fmtDay(outlook.etaMilestoneTs)} at your 4-week pace` : "";
  const goalLine = outlook.etaGoalTs && goalLbs != null ? ` You'd reach ${absWeight(goalLbs, unit, 0)} around ${fmtDay(outlook.etaGoalTs)}.` : "";
  const pctLine =
    outlook.nextPctMark != null && outlook.toNextPctLbs != null
      ? ` ${absWeight(outlook.toNextPctLbs, unit)} more reaches ${outlook.nextPctMark}% of your starting weight — a marker clinicians watch.`
      : "";
  return (
    <InsightCard
      emoji="🏁"
      title="Milestones & outlook"
      sub={`${absWeight(outlook.lostLbs, unit)} down · ${outlook.pctLost.toFixed(1)}% of start`}
      headline={`Next stop: ${absWeight(outlook.nextMilestoneLbs, unit, 0)} lost — ${absWeight(outlook.toNextMilestoneLbs, unit)} to go${eta}.${goalLine}${pctLine}`}
    >
      {outlook.reachedMarks.length > 0 && (
        <div className="insight-chips">
          {outlook.reachedMarks.map((m) => (
            <span key={m} className="pill-note teal">
              {m}% ✓
            </span>
          ))}
        </div>
      )}
    </InsightCard>
  );
}

export function TrendCard({ trend, unit }: WithUnit & { trend: TrendCheck }) {
  const change = `${trend.weeklyChangeLbs <= -0.05 ? "down" : trend.weeklyChangeLbs >= 0.05 ? "up" : "even at"} ${absWeight(Math.abs(trend.weeklyChangeLbs), unit)}`;
  const headline = trend.reassure
    ? `The latest weigh-in ticked up ${absWeight(trend.lastBlipLbs, unit)}, but your 7-day average is ${absWeight(trend.trendLbs, unit)} — ${change} from the week before. Single mornings are mostly water; the average is you.`
    : trend.weeklyChangeLbs <= -0.5
      ? `Your 7-day average is ${absWeight(trend.trendLbs, unit)}, ${change} from the week before — steady as she goes.`
      : `Your 7-day average is holding around ${absWeight(trend.trendLbs, unit)} (${change} vs the week before). Flat stretches are normal — protein, water, and walks still count.`;
  return (
    <InsightCard
      emoji="📉"
      title="The trend vs. today"
      sub="7-day average of your weigh-ins, so one morning can't yank you around"
      tone={trend.reassure || trend.weeklyChangeLbs <= -0.5 ? "info" : "note"}
      stats={[
        { value: absWeight(trend.trendLbs, unit), label: "7-day average" },
        { value: signedWeight(trend.weeklyChangeLbs, unit), label: "vs the week before" },
        { value: signedWeight(trend.lastBlipLbs, unit), label: "latest weigh-in" },
      ]}
      headline={headline}
    />
  );
}

export function FuelCard({ fuel, unit }: WithUnit & { fuel: FuelCheck }) {
  return (
    <InsightCard
      emoji="🔥"
      title="Fuel vs. pace"
      sub={`Average of ${fuel.days} logged days vs your 3-week trend — an estimate, not gospel`}
      tone={fuel.careNote ? "note" : "info"}
      stats={[
        { value: `${fuel.avgKcal}`, label: "kcal in / day" },
        { value: `${fuel.impliedBurnKcal}`, label: "implied burn" },
        { value: `${signedWeight(fuel.weeklyRateLbs, unit)}/wk`, label: "trend" },
      ]}
      headline={fuel.careNote ? `${fuel.summary} ${fuel.careNote}` : fuel.summary}
    />
  );
}

const PACE_COPY = {
  plateau: { emoji: "🧭", title: "Plateau check", tone: "note" as const },
  slowing: { emoji: "🐢", title: "Pace easing", tone: "note" as const },
  accelerating: { emoji: "🔥", title: "Pace picking up", tone: "info" as const },
  steady: { emoji: "📈", title: "Steady pace", tone: "info" as const },
};

function paceHeadline(p: PaceShift, unit: Unit): string {
  const recent = weeklyRateText(p.recentRate, unit);
  const prior = p.priorRate != null ? weeklyRateText(p.priorRate, unit) : undefined;
  switch (p.kind) {
    case "plateau":
      return `The scale has been flat for about two weeks after running ${prior} — stalls are common ${p.weeksOnDose} weeks into a dose, and the tape often keeps moving. Worth a mention to your provider if it lasts past 3–4 weeks.`;
    case "slowing":
      return `Your pace eased from ${prior} to ${recent} over the last three weeks. Normal as the body adapts — watch the tape and your energy, not just the scale.`;
    case "accelerating":
      return `Your pace picked up: ${prior} → ${recent} over the last three weeks.`;
    case "steady":
      return `Steady as she goes — about ${recent} over the last three weeks${prior ? ", right in line with the weeks before" : ""}.`;
  }
}

export function PaceCard({ pace, unit }: WithUnit & { pace: PaceShift }) {
  const copy = PACE_COPY[pace.kind];
  return (
    <InsightCard
      emoji={copy.emoji}
      title={copy.title}
      tone={copy.tone}
      stats={[
        { value: weeklyRateText(pace.recentRate, unit), label: "last 3 weeks" },
        ...(pace.priorRate != null ? [{ value: weeklyRateText(pace.priorRate, unit), label: "3 weeks before" }] : []),
        { value: `${pace.weeksOnDose} wks`, label: "on current dose" },
      ]}
      headline={paceHeadline(pace, unit)}
    />
  );
}

export function TapeCard({ tape, unit }: WithUnit & { tape: TapeVsScale }) {
  const measure = tape.measureLabel.toLowerCase();
  const ratio = tape.lbsPerInch != null ? ` — roughly ${absWeight(tape.lbsPerInch, unit)} per ${unit === "lbs" ? "inch" : "2.5 cm"} off your ${measure}` : "";
  const headline = tape.scaleFlatTapeMoving
    ? `Scale's barely moved lately (${signedWeight(tape.recentLbs ?? 0, unit)}), but your ${measure} is down ${signedLength(tape.recentInches, unit).replace("−", "")} — progress the scale can't see.`
    : `Since your first check-in your ${measure} moved ${signedLength(tape.inchesChange, unit)} while the scale moved ${signedWeight(tape.lbsChange, unit)}${ratio}.`;
  return (
    <InsightCard
      emoji="📏"
      title="Tape vs. scale"
      tone={tape.scaleFlatTapeMoving ? "info" : "note"}
      stats={[
        { value: signedLength(tape.inchesChange, unit), label: `${measure} since start` },
        { value: signedWeight(tape.lbsChange, unit), label: "weight, same span" },
      ]}
      headline={headline}
    />
  );
}

export function WaterWeightCard({ bump, unit }: WithUnit & { bump: ShotDayBump }) {
  const meaningful = Math.abs(bump.diffLbs) >= 0.3;
  return (
    <InsightCard
      emoji="💧"
      title="Shot-day water weight"
      sub={`${bump.nEarly} early-cycle and ${bump.nLate} late-cycle weigh-ins compared`}
      stats={[
        { value: signedWeight(bump.earlyAvg, unit), label: "days 1–3 vs. trend" },
        { value: signedWeight(bump.lateAvg, unit), label: `day ${bump.lateFromDay + 1}+ vs. trend` },
      ]}
      headline={
        meaningful
          ? `Weigh-ins in the three days after a shot run about ${absWeight(bump.diffLbs, unit)} ${bump.diffLbs > 0 ? "heavier" : "lighter"} than late-cycle ones — weigh-in day matters more than you'd think.`
          : "No real shot-day bump in your weigh-ins — weigh whenever suits you."
      }
    />
  );
}
