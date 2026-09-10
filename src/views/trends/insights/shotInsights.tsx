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
  const rest = health.restDays != null ? `each one rests ${health.restDays} days before it's used again` : "no site has been reused yet";
  const headline = perfect
    ? `Your last ${health.recentShots} shots hit ${health.recentShots} different sites 👏 — textbook rotation.${rednessLine}`
    : health.backToBack
      ? `The same site twice running in your last ${health.recentShots} shots — swapping sides every time is the one rule that keeps skin happy.${rednessLine}`
      : `Alternating across ${health.distinctSites} sites and ${rest} — that's what matters, not touring the whole map.${rednessLine}`;
  return (
    <InsightCard
      emoji="🔄"
      title="Injection sites"
      stats={[
        { value: `${health.distinctSites} of ${health.recentShots}`, label: "recent shots on distinct sites" },
        ...(health.restDays != null ? [{ value: `${health.restDays}d`, label: "rest before a site is reused" }] : []),
      ]}
      bars={health.redness.map((r) => ({
        label: r.label,
        pct: r.count / health.redness[0].count,
        display: `${r.count}`,
      }))}
      tone={health.redness.length > 0 ? "note" : "info"}
      headline={headline}
    />
  );
}
