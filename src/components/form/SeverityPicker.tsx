import type { Severity } from "../../types";
import { SEVERITIES } from "../../lib/effects";

interface Props {
  value: Severity;
  onChange: (severity: Severity) => void;
}

export default function SeverityPicker({ value, onChange }: Props) {
  return (
    <div className="sev-row" role="radiogroup" aria-label="Intensity">
      {SEVERITIES.map((s) => (
        <button
          key={s.value}
          role="radio"
          aria-checked={value === s.value}
          className={`sev-btn${value === s.value ? " active" : ""}`}
          onClick={() => onChange(s.value)}
        >
          <span className="sev-emoji">{s.emoji}</span>
          {s.label}
        </button>
      ))}
    </div>
  );
}
