import type { Unit } from "../../types";

const UNITS: Unit[] = ["lbs", "kg"];

interface Props {
  value: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ value, onChange }: Props) {
  return (
    <div className="unit-toggle" role="radiogroup" aria-label="Weight unit">
      {UNITS.map((u) => (
        <button key={u} role="radio" aria-checked={value === u} className={value === u ? "active" : ""} onClick={() => onChange(u)}>
          {u}
        </button>
      ))}
    </div>
  );
}
