import type { DoseStepEffects, SiteHealth } from "../../../lib/insights";
import InsightCard from "../../../components/InsightCard";

export function DoseStepsCard({ steps }: { steps: DoseStepEffects }) {
  const bump = steps.postRatePerWeek >= steps.otherRatePerWeek * 1.3 && steps.postRatePerWeek - steps.otherRatePerWeek >= 0.3;
  return (
    <InsightCard
      emoji="⬆️"
      title="Dose step-ups"
      sub={`${steps.increases} increase${steps.increases === 1 ? "" : "s"} so far · ${steps.windowDays}-day windows`}
      tone={bump ? "note" : "info"}
      stats={[
        { value: `${steps.postRatePerWeek.toFixed(1)}/wk`, label: "side effects after a step-up" },
        { value: `${steps.otherRatePerWeek.toFixed(1)}/wk`, label: "the rest of the time" },
      ]}
      headline={
        bump
          ? `Side effects cluster after dose increases, then settle within a couple of weeks — plan gentle days and easy meals right after your next step-up.`
          : "Dose increases haven't brought a noticeable bump in side effects for you — a good sign for the next step."
      }
    />
  );
}

export function SitesCard({ health }: { health: SiteHealth }) {
  const perfect = health.distinctSites === health.recentShots && health.recentShots >= 4;
  const rednessLine =
    health.redness.length > 0
      ? ` ${health.redness[0].label} has ${health.redness[0].count} redness ${health.redness[0].count === 1 ? "note" : "notes"} — give it a rest for a cycle or two.`
      : "";
  return (
    <InsightCard
      emoji="🔄"
      title="Injection sites"
      stats={[{ value: `${health.distinctSites} of ${health.recentShots}`, label: "recent shots on distinct sites" }]}
      bars={health.redness.map((r) => ({
        label: r.label,
        pct: r.count / health.redness[0].count,
        display: `${r.count}`,
      }))}
      tone={health.redness.length > 0 ? "note" : "info"}
      headline={
        perfect
          ? `Your last ${health.recentShots} shots hit ${health.recentShots} different sites 👏 — textbook rotation.${rednessLine}`
          : `${health.distinctSites} distinct sites in your last ${health.recentShots} shots — following the ✦ next up tag spreads them evenly.${rednessLine}`
      }
    />
  );
}
