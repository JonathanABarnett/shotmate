import type { Settings } from "../../types";
import { useStore } from "../../store/StoreProvider";
import { medFor } from "../../lib/meds";
import { Field } from "../../components/form/fields";
import MedPicker from "../../components/form/MedPicker";
import DosePicker from "../../components/form/DosePicker";
import Stepper from "../../components/form/Stepper";

const HOURS_PER_DAY = 24;

export default function MedicationSection() {
  const { data, dispatch } = useStore();
  const { settings } = data;
  const med = medFor(settings);
  const patch = (p: Partial<Settings>) => dispatch({ type: "updateSettings", patch: p });

  return (
    <section className="card">
      <Field label="Medication">
        <MedPicker value={settings.medKey} onChange={(medKey) => patch({ medKey })} />
      </Field>

      {settings.medKey === "custom" && (
        <>
          <Field label="Medication name">
            <input
              className="input"
              placeholder="e.g. Compounded semaglutide"
              value={settings.customMedName ?? ""}
              onChange={(e) => patch({ customMedName: e.target.value })}
            />
          </Field>
          <Field label="Half-life (days)" hint="Used for the medication-level estimate. Ask your pharmacist if unsure.">
            <Stepper
              value={Math.round(((settings.customHalfLifeH ?? 120) / HOURS_PER_DAY) * 10) / 10}
              onChange={(days) => patch({ customHalfLifeH: days * HOURS_PER_DAY })}
              step={0.5}
              min={0.5}
              max={30}
              unit="days"
            />
          </Field>
        </>
      )}

      <Field label="Planned dose">
        <DosePicker med={med} value={settings.plannedDoseMg} onChange={(plannedDoseMg) => patch({ plannedDoseMg })} />
      </Field>

      <Field label="Shot schedule" hint={`Half-life used for estimates: ~${(med.halfLifeH / HOURS_PER_DAY).toFixed(1)} days.`}>
        <Stepper
          value={settings.scheduleDays}
          onChange={(scheduleDays) => patch({ scheduleDays })}
          step={1}
          min={1}
          max={90}
          unit={settings.scheduleDays === 1 ? "day between shots" : "days between shots"}
        />
      </Field>
    </section>
  );
}
