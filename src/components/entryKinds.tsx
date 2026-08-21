import { Camera, Footprints, HeartPulse, Ruler, Scale, Syringe, Trophy, type LucideIcon } from "lucide-react";

export type EntryKind = "shot" | "weight" | "effect" | "measure" | "photo" | "win" | "activity";

export type Tone = "violet" | "teal" | "coral" | "gold" | "sky" | "rose" | "green";

export interface EntryKindMeta {
  label: string;
  tone: Tone;
  Icon: LucideIcon;
}

/** Insertion order doubles as the log-menu order. */
export const ENTRY_KINDS: Record<EntryKind, EntryKindMeta> = {
  shot: { label: "Shot", tone: "violet", Icon: Syringe },
  weight: { label: "Weight", tone: "teal", Icon: Scale },
  measure: { label: "Measurements", tone: "gold", Icon: Ruler },
  activity: { label: "Activity", tone: "green", Icon: Footprints },
  effect: { label: "How I feel", tone: "coral", Icon: HeartPulse },
  photo: { label: "Progress photo", tone: "sky", Icon: Camera },
  win: { label: "Win", tone: "rose", Icon: Trophy },
};

interface BadgeProps {
  kind: EntryKind;
  size?: number;
}

/** The colored icon bubble used in lists and sheet titles. */
export function EntryBadge({ kind, size = 19 }: BadgeProps) {
  const { tone, Icon } = ENTRY_KINDS[kind];
  return (
    <span className={`entry-ico ${tone}`}>
      <Icon size={size} />
    </span>
  );
}
