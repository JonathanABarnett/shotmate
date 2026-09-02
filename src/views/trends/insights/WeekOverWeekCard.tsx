import type { Unit } from "../../../types";
import type { WeekCompare } from "../../../lib/insights";
import InsightCard from "../../../components/InsightCard";
import { absWeight, signedWeight } from "../../../lib/format";

const FLAT = 0.2;
const SHIFT = 0.3;

function weightLine(weight: NonNullable<WeekCompare["weight"]>, unit: Unit): string | undefined {
  const { thisRateLbs: now, priorRateLbs: prior } = weight;
  if (prior == null) return undefined;
  const nowTxt = absWeight(Math.abs(now), unit);
  const priorTxt = absWeight(Math.abs(prior), unit);
  if (now <= -FLAT && prior <= -FLAT) {
    if (now <= prior - SHIFT) return `Down ${nowTxt} this week after ${priorTxt} the week before — the pace picked up.`;
    if (now >= prior + SHIFT) return `Down ${nowTxt} this week after ${priorTxt} the week before — a gentler week, same direction.`;
    return `Down ${nowTxt} this week, right on last week's ${priorTxt} — a steady, repeatable pace.`;
  }
  if (now <= -FLAT) return `Down ${nowTxt} this week after a flat one — moving again.`;
  if (prior <= -FLAT) return `A flat week after ${priorTxt} down — normal rhythm, and the month still points down.`;
  return `Two quiet weeks on the scale — the tape, walks, and protein still count.`;
}

function activityLine(activity: NonNullable<WeekCompare["activity"]>): string {
  const { sessions, priorSessions } = activity;
  if (sessions > priorSessions) return `And you moved more — ${sessions} sessions to last week's ${priorSessions}.`;
  if (sessions === priorSessions && sessions > 0) return `Movement held steady at ${sessions} sessions.`;
  if (sessions > 0) return `${sessions} ${sessions === 1 ? "move" : "moves"} in so far, quieter than last week — every one counts.`;
  return `No moves logged yet this week — a ten-minute walk flips that.`;
}

export default function WeekOverWeekCard({ week, unit }: { week: WeekCompare; unit: Unit }) {
  const { weight, activity } = week;
  const headline = [weight && weightLine(weight, unit), activity && activityLine(activity)].filter(Boolean).join(" ");
  const goodWeek = (weight?.thisRateLbs ?? 0) <= -FLAT || (activity != null && activity.sessions >= activity.priorSessions);
  return (
    <InsightCard
      emoji="📆"
      title="Week over week"
      sub="This rolling week vs the one before"
      tone={goodWeek ? "info" : "note"}
      stats={[
        ...(weight ? [{ value: `${signedWeight(weight.thisRateLbs, unit)}`, label: "scale, this week" }] : []),
        ...(weight?.priorRateLbs != null ? [{ value: `${signedWeight(weight.priorRateLbs, unit)}`, label: "week before" }] : []),
        ...(activity ? [{ value: `${activity.minutes} min`, label: `${activity.sessions} moves this week` }] : []),
        ...(activity ? [{ value: `${activity.priorMinutes} min`, label: `${activity.priorSessions} week before` }] : []),
      ]}
      headline={headline}
    />
  );
}
