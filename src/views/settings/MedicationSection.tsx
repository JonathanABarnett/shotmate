import type { AppData, Settings } from "../../types";
import { useStore } from "../../store/StoreProvider";
import { medFor } from "../../lib/meds";
import { drawVolume, fmtDraw } from "../../lib/draw";
import { supplyStatus } from "../../lib/supply";
import { Field } from "../../components/form/fields";
import MedPicker from "../../components/form/MedPicker";
import DosePicker from "../../components/form/DosePicker";
import Stepper from "../../components/form/Stepper";
import OptionalNumberField from "../../components/form/OptionalNumberField";

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

      <OptionalNumberField
        label="Vial concentration (optional)"
        hint={vialHint(settings)}
        suffix="mg/mL"
        placeholder="e.g. 10"
        value={settings.vialMgPerMl}
        onChange={(vialMgPerMl) => patch({ vialMgPerMl })}
        max={500}
      />

      <OptionalNumberField
        label="Medication on hand (optional)"
        hint={supplyHint(data)}
        suffix="mg"
        placeholder="e.g. 40"
        value={settings.supplyMg}
        onChange={(supplyMg) =>
          patch(supplyMg != null ? { supplyMg, supplySetTs: Date.now() } : { supplyMg: undefined, supplySetTs: undefined })
        }
        max={10_000}
      />
    </section>
  );
}

function vialHint(settings: Settings): string {
  const draw = settings.vialMgPerMl != null ? drawVolume(settings.plannedDoseMg, settings.vialMgPerMl) : undefined;
  if (!draw) return "For compounded vials — shows how much to draw for each dose.";
  return `${settings.plannedDoseMg} mg ≈ ${fmtDraw(draw)}. Double-check against your pharmacy's instructions.`;
}

function supplyHint(data: AppData): string {
  const status = supplyStatus(data);
  if (!status) return "Total mg in your vials right now — shots you log from here on count against it.";
  return `≈ ${status.remainingMg} mg left · about ${status.shotsLeft} more ${status.shotsLeft === 1 ? "shot" : "shots"} at your planned dose.`;
}
