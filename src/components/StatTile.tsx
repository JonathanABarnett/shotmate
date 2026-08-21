import type { ReactNode } from "react";
import type { Tone } from "./entryKinds";

export type DeltaTone = "good" | "bad" | "neutral";

const DELTA_CLASS: Record<DeltaTone, string> = {
  good: "delta-down",
  bad: "delta-up",
  neutral: "delta-flat",
};

interface Props {
  tone: Tone | "gold";
  icon: ReactNode;
  value: string;
  suffix?: string;
  label: string;
  delta?: { text: string; tone: DeltaTone };
}

export default function StatTile({ tone, icon, value, suffix, label, delta }: Props) {
  return (
    <div className="tile">
      <div className={`tile-icon ${tone}`}>{icon}</div>
      <div className="tile-value">
        {value}
        {suffix && <small>{suffix}</small>}
      </div>
      <div className="tile-label">{label}</div>
      {delta && <div className={`tile-delta ${DELTA_CLASS[delta.tone]}`}>{delta.text}</div>}
    </div>
  );
}
