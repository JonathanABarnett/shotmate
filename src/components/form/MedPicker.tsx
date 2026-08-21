import { MEDS } from "../../lib/meds";

interface Props {
  value: string;
  onChange: (medKey: string) => void;
}

/** Grid of medication cards. */
export default function MedPicker({ value, onChange }: Props) {
  return (
    <div className="med-grid" role="radiogroup" aria-label="Medication">
      {MEDS.map((med) => (
        <button
          key={med.key}
          role="radio"
          aria-checked={value === med.key}
          className={`med-card${value === med.key ? " active" : ""}`}
          onClick={() => onChange(med.key)}
        >
          <span className="med-emoji">{med.emoji}</span>
          <div className="med-name">{med.brand}</div>
          <div className="med-generic">{med.generic}</div>
        </button>
      ))}
    </div>
  );
}
