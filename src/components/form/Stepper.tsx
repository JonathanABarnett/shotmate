import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  format?: (value: number) => string;
}

const round = (v: number) => Math.round(v * 100) / 100;

/** Big friendly +/- numeric control. */
export default function Stepper({ value, onChange, step = 1, min = 0, max = Infinity, unit, format }: Props) {
  const set = (v: number) => onChange(round(Math.max(min, Math.min(max, v))));
  return (
    <div className="stepper">
      <button className="stepper-btn" aria-label="Decrease" onClick={() => set(value - step)}>
        <Minus size={20} />
      </button>
      <div className="stepper-value">
        {format ? format(value) : value}
        {unit && <small>{unit}</small>}
      </div>
      <button className="stepper-btn" aria-label="Increase" onClick={() => set(value + step)}>
        <Plus size={20} />
      </button>
    </div>
  );
}
