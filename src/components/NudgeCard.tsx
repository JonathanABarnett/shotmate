import { X } from "lucide-react";
import type { Nudge } from "../lib/nudges";

interface Props {
  nudge: Nudge;
  onAction: () => void;
  onDismiss: () => void;
}

/** One dismissible suggestion — Home shows at most one at a time. */
export default function NudgeCard({ nudge, onAction, onDismiss }: Props) {
  return (
    <section className="card nudge-card">
      <span className="nudge-emoji" aria-hidden="true">
        {nudge.emoji}
      </span>
      <p className="nudge-text">{nudge.text}</p>
      <button className="btn btn-primary btn-sm" onClick={onAction}>
        {nudge.cta}
      </button>
      <button className="nudge-dismiss" aria-label="Not now" onClick={onDismiss}>
        <X size={16} />
      </button>
    </section>
  );
}
