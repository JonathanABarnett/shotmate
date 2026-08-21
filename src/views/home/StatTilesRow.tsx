import { Droplets, Flame, Scale } from "lucide-react";
import type { AppData } from "../../types";
import { medFor } from "../../lib/meds";
import { levelAt } from "../../lib/pk";
import { streak } from "../../lib/shots";
import { fmtWeight, latestWeight, startWeightLbs, toDisplayWeight } from "../../lib/weight";
import StatTile, { type DeltaTone } from "../../components/StatTile";

function weightDelta(data: AppData): { text: string; tone: DeltaTone } | undefined {
  const start = startWeightLbs(data);
  const current = latestWeight(data.weights)?.lbs;
  if (start == null || current == null) return undefined;
  const diff = toDisplayWeight(current - start, data.settings.unit);
  if (Math.abs(diff) < 0.05) return { text: "— no change", tone: "neutral" };
  const arrow = diff < 0 ? "↓" : "↑";
  return {
    text: `${arrow} ${Math.abs(diff).toFixed(1)} ${data.settings.unit}`,
    tone: diff < 0 ? "good" : "bad",
  };
}

export default function StatTilesRow({ data }: { data: AppData }) {
  const { settings } = data;
  const med = medFor(settings);
  const current = latestWeight(data.weights);
  const level = levelAt(Date.now(), data.shots, med.halfLifeH);
  const shotStreak = streak(data.shots, settings.scheduleDays);

  return (
    <div className="tiles">
      <StatTile
        tone="teal"
        icon={<Scale size={17} />}
        value={current ? fmtWeight(current.lbs, settings.unit, false) : "—"}
        suffix={current ? settings.unit : undefined}
        label="Weight"
        delta={weightDelta(data)}
      />
      <StatTile
        tone="violet"
        icon={<Droplets size={17} />}
        value={data.shots.length > 0 ? level.toFixed(1) : "—"}
        suffix={data.shots.length > 0 ? "mg" : undefined}
        label="Est. in system"
      />
      <StatTile
        tone="gold"
        icon={<Flame size={17} />}
        value={shotStreak > 0 ? `${shotStreak}` : "—"}
        suffix={shotStreak > 0 ? (shotStreak === 1 ? "shot" : "shots") : undefined}
        label="On-time streak"
      />
    </div>
  );
}
