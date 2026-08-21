import type { ReactNode } from "react";
import { fromLocalInputValue, toLocalInputValue } from "../../lib/dates";

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

/** Label + control + optional hint — the one field wrapper every form uses. */
export function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}

interface DateTimeFieldProps {
  value: number;
  onChange: (ts: number) => void;
  label?: string;
}

export function DateTimeField({ value, onChange, label = "When" }: DateTimeFieldProps) {
  return (
    <Field label={label}>
      <input
        type="datetime-local"
        className="input"
        value={toLocalInputValue(value)}
        max={toLocalInputValue(Date.now() + 60_000)}
        onChange={(e) => onChange(fromLocalInputValue(e.target.value))}
      />
    </Field>
  );
}

interface NoteFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function NoteField({ value, onChange }: NoteFieldProps) {
  return (
    <Field label="Note (optional)">
      <textarea
        className="input"
        placeholder="Anything worth remembering?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
      />
    </Field>
  );
}
