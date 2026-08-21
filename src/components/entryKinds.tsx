import { HeartPulse, Ruler, Scale, Syringe, type LucideIcon } from "lucide-react";

export type EntryKind = "shot" | "weight" | "effect" | "measure";

export type Tone = "violet" | "teal" | "coral" | "gold";

export interface EntryKindMeta {
  label: string;
  tone: Tone;
  Icon: LucideIcon;
}

export const ENTRY_KINDS: Record<EntryKind, EntryKindMeta> = {
  shot: { label: "Shot", tone: "violet", Icon: Syringe },
  weight: { label: "Weight", tone: "teal", Icon: Scale },
  measure: { label: "Measurements", tone: "gold", Icon: Ruler },
  effect: { label: "How I feel", tone: "coral", Icon: HeartPulse },
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
