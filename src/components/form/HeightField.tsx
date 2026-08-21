import { useState } from "react";
import type { Unit } from "../../types";
import { Field } from "./fields";

const CM_PER_IN = 2.54;

interface Props {
  heightIn: number | undefined;
  onChange: (heightIn: number | undefined) => void;
  unit: Unit;
}

/** "" → undefined; otherwise a non-negative number (0 is a valid inches value). */
const toNumber = (value: string): number | undefined => {
  if (value.trim() === "") return undefined;
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

const digitsOnly = (raw: string) => raw.replace(/[^\d.]/g, "");

function ImperialHeight({ heightIn, onChange }: Omit<Props, "unit">) {
  const known = heightIn != null && heightIn > 0;
  const [ftText, setFtText] = useState(known ? String(Math.floor(heightIn / 12)) : "");
  const [inText, setInText] = useState(known ? String(Math.round(heightIn % 12)) : "");

  const commit = (ft: string, inches: string) => {
    const f = toNumber(ft);
    const i = toNumber(inches);
    const total = (f ?? 0) * 12 + (i ?? 0);
    onChange(total > 0 ? total : undefined);
  };

  return (
    <div className="input-row">
      <input
        className="input"
        inputMode="numeric"
        placeholder="5"
        aria-label="Height, feet"
        value={ftText}
        onChange={(e) => {
          const next = digitsOnly(e.target.value);
          setFtText(next);
          commit(next, inText);
        }}
      />
      <div className="input input-suffix">ft</div>
      <input
        className="input"
        inputMode="numeric"
        placeholder="10"
        aria-label="Height, inches"
        value={inText}
        onChange={(e) => {
          const next = digitsOnly(e.target.value);
          setInText(next);
          commit(ftText, next);
        }}
      />
      <div className="input input-suffix">in</div>
    </div>
  );
}

function MetricHeight({ heightIn, onChange }: Omit<Props, "unit">) {
  const known = heightIn != null && heightIn > 0;
  const [cmText, setCmText] = useState(known ? String(Math.round(heightIn * CM_PER_IN)) : "");
  return (
    <div className="input-row">
      <input
        className="input"
        inputMode="numeric"
        placeholder="178"
        aria-label="Height, centimeters"
        value={cmText}
        onChange={(e) => {
          const next = digitsOnly(e.target.value);
          setCmText(next);
          const cm = toNumber(next);
          onChange(cm != null && cm > 0 ? cm / CM_PER_IN : undefined);
        }}
      />
      <div className="input input-suffix">cm</div>
    </div>
  );
}

/** Height entry as ft + in (lbs users) or cm (kg users); stores inches either way. */
export default function HeightField({ heightIn, onChange, unit }: Props) {
  return (
    <Field label="Height (optional)" hint="Used only to show your BMI.">
      {unit === "kg" ? <MetricHeight heightIn={heightIn} onChange={onChange} /> : <ImperialHeight heightIn={heightIn} onChange={onChange} />}
    </Field>
  );
}
