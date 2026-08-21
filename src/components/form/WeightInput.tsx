import type { Unit } from "../../types";

interface Props {
  value: string;
  onChange: (value: string) => void;
  unit: Unit;
  autoFocus?: boolean;
}

export function parseWeightInput(value: string): number | undefined {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed > 20 && parsed < 1500 ? parsed : undefined;
}

/** Large centered numeric entry for body weight. */
export default function WeightInput({ value, onChange, unit, autoFocus }: Props) {
  return (
    <div className="bigweight">
      <input
        inputMode="decimal"
        autoFocus={autoFocus}
        placeholder="0.0"
        value={value}
        aria-label={`Weight in ${unit}`}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
      />
      <span>{unit}</span>
    </div>
  );
}
