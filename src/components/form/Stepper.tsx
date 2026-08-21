import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
}

const round = (v: number) => Math.round(v * 100) / 100;

/** Big friendly +/- numeric control — the center value is also directly typeable. */
export default function Stepper({ value, onChange, step = 1, min = 0, max = Infinity, unit }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const set = (v: number) => onChange(round(Math.max(min, Math.min(max, v))));

  const commit = (raw: string) => {
    const parsed = parseFloat(raw);
    if (Number.isFinite(parsed)) set(parsed);
    setDraft(null);
  };

  const shown = draft ?? String(value);

  return (
    <div className="stepper">
      <button className="stepper-btn" aria-label="Decrease" onClick={() => set(value - step)}>
        <Minus size={20} />
      </button>
      <div className="stepper-value">
        <input
          className="stepper-input"
          inputMode="decimal"
          value={shown}
          style={{ width: `${Math.max(1, shown.length)}ch` }}
          aria-label={unit ? `Value in ${unit}` : "Value"}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setDraft(e.target.value.replace(/[^\d.]/g, ""))}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
        />
        {unit && <small>{unit}</small>}
      </div>
      <button className="stepper-btn" aria-label="Increase" onClick={() => set(value + step)}>
        <Plus size={20} />
      </button>
    </div>
  );
}
