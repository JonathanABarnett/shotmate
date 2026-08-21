import { useState } from "react";
import { Field } from "./fields";

interface Props {
  label: string;
  hint?: string;
  suffix: string;
  placeholder?: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  max?: number;
}

/** Optional decimal input with a unit suffix — clears back to "unset". */
export default function OptionalNumberField({ label, hint, suffix, placeholder = "—", value, onChange, max = 100_000 }: Props) {
  const [text, setText] = useState(value != null ? String(value) : "");

  const handleChange = (raw: string) => {
    const cleaned = raw.replace(/[^\d.]/g, "");
    setText(cleaned);
    if (cleaned === "") {
      onChange(undefined);
      return;
    }
    const parsed = parseFloat(cleaned);
    if (Number.isFinite(parsed) && parsed > 0 && parsed <= max) onChange(parsed);
  };

  return (
    <Field label={label} hint={hint}>
      <div className="input-row">
        <input className="input" inputMode="decimal" placeholder={placeholder} value={text} onChange={(e) => handleChange(e.target.value)} />
        <div className="input input-suffix">{suffix}</div>
      </div>
    </Field>
  );
}
