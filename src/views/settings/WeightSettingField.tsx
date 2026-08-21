import { useState } from "react";
import type { Unit } from "../../types";
import { fromDisplayWeight, toDisplayWeight } from "../../lib/weight";
import { Field } from "../../components/form/fields";
import { parseWeightInput } from "../../components/form/WeightInput";

interface Props {
  label: string;
  hint?: string;
  lbs: number | undefined;
  unit: Unit;
  onChange: (lbs: number | undefined) => void;
}

/** Settings weight input — edits in display units, stores canonical lbs. */
export default function WeightSettingField({ label, hint, lbs, unit, onChange }: Props) {
  const [text, setText] = useState(lbs != null ? String(Math.round(toDisplayWeight(lbs, unit) * 10) / 10) : "");

  const handleChange = (raw: string) => {
    const cleaned = raw.replace(/[^\d.]/g, "");
    setText(cleaned);
    if (cleaned === "") {
      onChange(undefined);
      return;
    }
    const parsed = parseWeightInput(cleaned);
    if (parsed != null) onChange(Math.round(fromDisplayWeight(parsed, unit) * 100) / 100);
  };

  return (
    <Field label={label} hint={hint}>
      <div className="input-row">
        <input className="input" inputMode="decimal" placeholder="—" value={text} onChange={(e) => handleChange(e.target.value)} />
        <div className="input input-suffix">{unit}</div>
      </div>
    </Field>
  );
}
