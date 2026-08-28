import { X } from "lucide-react";
import type { WinSuggestion } from "../../lib/winSuggestions";

interface Props {
  suggestion: WinSuggestion;
  onSave: () => void;
  onSkip: () => void;
}

/** The data spotted something win-worthy — one tap keeps it. */
export default function WinSuggestCard({ suggestion, onSave, onSkip }: Props) {
  return (
    <section className="card nudge-card win-suggest">
      <span className="nudge-emoji" aria-hidden="true">
        🎉
      </span>
      <p className="nudge-text">
        <strong>{suggestion.text}</strong> — worth keeping as a win?
      </p>
      <button className="btn btn-primary btn-sm" onClick={onSave}>
        Save it
      </button>
      <button className="nudge-dismiss" aria-label="Not this one" onClick={onSkip}>
        <X size={16} />
      </button>
    </section>
  );
}
