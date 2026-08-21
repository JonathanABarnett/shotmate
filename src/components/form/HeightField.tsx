import type { Unit } from "../../types";
import { Field } from "./fields";

const CM_PER_IN = 2.54;

interface Props {
  heightIn: number | undefined;
  onChange: (heightIn: number | undefined) => void;
  unit: Unit;
}

const toNumber = (value: string): number | undefined => {
  const n = parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/** Height entry as ft+in (lbs users) or cm (kg users); stores inches either way. */
export default function HeightField({ heightIn, onChange, unit }: Props) {
  if (unit === "kg") {
    const cm = heightIn != null ? Math.round(heightIn * CM_PER_IN) : undefined;
    return (
      <Field label="Height (optional)" hint="Used only to show your BMI.">
        <input
          className="input"
          inputMode="numeric"
          placeholder="cm"
          value={cm ?? ""}
          onChange={(e) => {
            const v = toNumber(e.target.value);
            onChange(v != null ? v / CM_PER_IN : undefined);
          }}
        />
      </Field>
    );
  }

  const ft = heightIn != null ? Math.floor(heightIn / 12) : undefined;
  const inches = heightIn != null ? Math.round(heightIn % 12) : undefined;
  const update = (nextFt: number | undefined, nextIn: number | undefined) => {
    if (nextFt == null && nextIn == null) onChange(undefined);
    else onChange((nextFt ?? 0) * 12 + (nextIn ?? 0));
  };

  return (
    <Field label="Height (optional)" hint="Used only to show your BMI.">
      <div className="input-row">
        <input
          className="input"
          inputMode="numeric"
          placeholder="ft"
          value={ft ?? ""}
          onChange={(e) => update(toNumber(e.target.value), inches)}
        />
        <input
          className="input"
          inputMode="numeric"
          placeholder="in"
          value={inches ?? ""}
          onChange={(e) => update(ft, toNumber(e.target.value))}
        />
      </div>
    </Field>
  );
}
