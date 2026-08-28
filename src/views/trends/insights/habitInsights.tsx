import type { Unit } from "../../../types";
import type { ActivityPace, Adherence, CreepInsight, MovementHabit, SleepInsight, TimeOfDay } from "../../../lib/insights";
import { fmtDistance } from "../../../lib/activity";
import InsightCard from "../../../components/InsightCard";
import { absWeight, signedWeight } from "../../../lib/format";

export function CreepCard({ creep }: { creep: CreepInsight }) {
  const filled = creep.buckets.filter((b) => b.n > 0);
  return (
    <InsightCard
      emoji="🍽️"
      title="Hunger & energy across your cycle"
      sub="Average check-in by day since your shot (1 = none, 5 = ravenous / great)"
      tone={creep.rising ? "note" : "info"}
      headline={creep.energyNote ? `${creep.summary} ${creep.energyNote}` : creep.summary}
    >
      <div className="mood-table">
        <div className="mood-row">
          <span className="mood-head">Day</span>
          <span className="mood-head">🍽️ hunger</span>
          <span className="mood-head">⚡ energy</span>
        </div>
        {filled.map((b) => (
          <div className="mood-row" key={b.offsetDays}>
            <span className="freq-name">{b.label}</span>
            <span className="mood-val">{b.hunger != null ? b.hunger.toFixed(1) : "—"}</span>
            <span className="mood-val">{b.energy != null ? b.energy.toFixed(1) : "—"}</span>
          </div>
        ))}
      </div>
    </InsightCard>
  );
}

const signedShift = (n: number) => `${n > 0.05 ? "+" : n < -0.05 ? "−" : "±"}${Math.abs(n).toFixed(1)}`;

export function SleepCard({ sleep }: { sleep: SleepInsight }) {
  if (sleep.kind === "quality") {
    return (
      <InsightCard
        emoji="😴"
        title="Sleep"
        sub="Your nightly ratings so far"
        tone="note"
        stats={[
          { value: sleep.avg.toFixed(1), label: `avg across ${sleep.nights} nights` },
          { value: `${Math.round(sleep.roughShare * 100)}%`, label: "rough or broken" },
        ]}
        headline={sleep.summary}
      />
    );
  }
  const goodShort = sleep.goodLabel.split(" ")[0];
  return (
    <InsightCard
      emoji="😴"
      title="Sleep vs. hunger"
      sub={`Hunger vs. your usual for that cycle day, after rough (1–2) and ${sleep.goodLabel}`}
      tone={sleep.delta >= 0.5 ? "note" : "info"}
      stats={[
        { value: signedShift(sleep.poorShift), label: `after ${sleep.poorNights} rough nights` },
        { value: signedShift(sleep.goodShift), label: `after ${sleep.goodNights} ${goodShort} nights` },
      ]}
      headline={sleep.energyNote ? `${sleep.summary} ${sleep.energyNote}` : sleep.summary}
    />
  );
}

export function MovementCard({ habit, unit }: { habit: MovementHabit; unit: Unit }) {
  return (
    <InsightCard
      emoji="🚶"
      title="Movement habit"
      sub="Walks and workouts over the last two weeks"
      stats={[
        habit.streakDays >= 3
          ? { value: `${habit.streakDays}`, label: "day streak" }
          : { value: `${habit.activeDays14}/14`, label: "active days" },
        { value: `${habit.weekMinutes}`, label: "min, last 7 days" },
        ...(habit.weekMiles != null ? [{ value: fmtDistance(habit.weekMiles, unit), label: "distance" }] : []),
      ]}
      headline={habit.summary}
    />
  );
}

export function TimeOfDayCard({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  return (
    <InsightCard
      emoji="🕑"
      title="Hunger through the day"
      sub="Average hunger by time of day (1 = none, 5 = ravenous)"
      tone={timeOfDay.peak ? "note" : "info"}
      stats={timeOfDay.slots
        .filter((s) => s.hunger != null)
        .map((s) => ({ value: s.hunger!.toFixed(1), label: `${s.label.toLowerCase()} (${s.n})` }))}
      headline={timeOfDay.energyNote ? `${timeOfDay.summary} ${timeOfDay.energyNote}` : timeOfDay.summary}
    />
  );
}

export function ActivityPaceCard({ pace, unit }: { pace: ActivityPace; unit: Unit }) {
  const edge = pace.quiet.avgChangeLbs - pace.active.avgChangeLbs;
  const headline =
    edge >= 0.2
      ? `In weeks you logged ${pace.thresholdMinutes}+ active minutes, the scale moved about ${absWeight(edge, unit)} more per week than in quieter weeks. Association, not proof — but a nice nudge.`
      : "Your weekly pace looks similar in active and quieter weeks — movement still pays off in energy, mood, and muscle.";
  return (
    <InsightCard
      emoji="👟"
      title="Moving vs. the scale"
      stats={[
        { value: `${signedWeight(pace.active.avgChangeLbs, unit)}/wk`, label: `${pace.active.weeks} active weeks` },
        { value: `${signedWeight(pace.quiet.avgChangeLbs, unit)}/wk`, label: `${pace.quiet.weeks} quieter weeks` },
      ]}
      headline={headline}
    />
  );
}

export function AdherenceCard({ adherence }: { adherence: Adherence }) {
  const pct = Math.round(adherence.onTimeRate * 100);
  const drift = Math.abs(adherence.avgDriftHours);
  const driftText = drift < 1 ? "right on schedule on average" : `about ${Math.round(drift)}h ${adherence.avgDriftHours > 0 ? "late" : "early"} on average`;
  const headline =
    pct >= 85
      ? `${pct}% of your shots landed within a day of schedule, ${driftText} — that consistency keeps medication levels smooth.`
      : `${pct}% of your shots landed within a day of schedule, ${driftText}. Tying shot day to a fixed ritual (same evening, same show) helps.`;
  return (
    <InsightCard
      emoji="✅"
      title="Consistency"
      stats={[
        { value: `${pct}%`, label: `on time (${adherence.gaps} gaps)` },
        { value: adherence.weighInsPerWeek.toFixed(1), label: "weigh-ins / week" },
      ]}
      headline={headline}
    />
  );
}
