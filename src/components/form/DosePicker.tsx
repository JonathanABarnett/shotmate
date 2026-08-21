import type { MedInfo } from "../../lib/meds";
import ChipGroup from "./ChipGroup";
import Stepper from "./Stepper";

const DOSE_STEP = 0.25;

interface Props {
  med: MedInfo;
  value: number;
  onChange: (doseMg: number) => void;
}

/** The medication's usual ladder as chips, with fine-grained +/- below. */
export default function DosePicker({ med, value, onChange }: Props) {
  return (
    <>
      <ChipGroup
        className="dose-chips"
        options={med.doses.map((d) => ({ key: String(d), label: `${d} mg` }))}
        selected={[String(value)]}
        onToggle={(key) => onChange(Number(key))}
      />
      <Stepper value={value} onChange={onChange} step={DOSE_STEP} min={DOSE_STEP} unit="mg" />
    </>
  );
}
