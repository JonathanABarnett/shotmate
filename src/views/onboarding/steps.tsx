import type { ReactNode } from "react";
import { MEDS, medFor } from "../../lib/meds";
import { Field } from "../../components/form/fields";
import MedPicker from "../../components/form/MedPicker";
import DosePicker from "../../components/form/DosePicker";
import Stepper from "../../components/form/Stepper";
import UnitToggle from "../../components/form/UnitToggle";
import WeightInput from "../../components/form/WeightInput";
import HeightField from "../../components/form/HeightField";
import type { OnboardingDraft } from "./draft";

export interface StepProps {
  draft: OnboardingDraft;
  patch: (p: Partial<OnboardingDraft>) => void;
}

function StepHeading({ title, sub }: { title: ReactNode; sub: string }) {
  return (
    <>
      <h1 className="onb-title">{title}</h1>
      <p className="onb-sub">{sub}</p>
    </>
  );
}

export function WelcomeStep({ draft, patch }: StepProps) {
  return (
    <>
      <img className="onb-hero-art" src="/icon.svg" alt="" />
      <StepHeading
        title={
          <>
            Meet <span className="grad-text">ShotMate</span>
          </>
        }
        sub="Your friendly GLP-1 companion — shots, weight, and how you feel, all in one cozy place. Private, on your device."
      />
      <Field label="What should we call you? (optional)">
        <input
          className="input"
          placeholder="Your name"
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value })}
        />
      </Field>
    </>
  );
}

export function MedStep({ draft, patch }: StepProps) {
  const med = medFor({ medKey: draft.medKey, customMedName: draft.customMedName });
  return (
    <>
      <StepHeading title="Your medication" sub="Pick your pen — we'll tailor doses, schedules, and estimates to it." />
      <Field label="Medication">
        <MedPicker
          value={draft.medKey}
          onChange={(medKey) => {
            const nextMed = MEDS.find((m) => m.key === medKey)!;
            patch({ medKey, doseMg: nextMed.doses.includes(draft.doseMg) ? draft.doseMg : nextMed.doses[0] });
          }}
        />
      </Field>
      {draft.medKey === "custom" && (
        <Field label="Medication name">
          <input
            className="input"
            placeholder="e.g. Compounded semaglutide"
            value={draft.customMedName}
            onChange={(e) => patch({ customMedName: e.target.value })}
          />
        </Field>
      )}
      <Field label="Current dose">
        <DosePicker med={med} value={draft.doseMg} onChange={(doseMg) => patch({ doseMg })} />
      </Field>
      <Field label="How often?">
        <Stepper
          value={draft.scheduleDays}
          onChange={(scheduleDays) => patch({ scheduleDays })}
          step={1}
          min={1}
          max={90}
          unit={draft.scheduleDays === 1 ? "day between shots" : "days between shots"}
        />
      </Field>
    </>
  );
}

export function BodyStep({ draft, patch }: StepProps) {
  return (
    <>
      <StepHeading title="Your starting point" sub="All optional — but a starting weight and a goal make the charts sing." />
      <Field label="Units">
        <UnitToggle value={draft.unit} onChange={(unit) => patch({ unit })} />
      </Field>
      <Field label="Current weight">
        <WeightInput value={draft.currentWeightText} onChange={(currentWeightText) => patch({ currentWeightText })} unit={draft.unit} />
      </Field>
      <Field label="Goal weight">
        <WeightInput value={draft.goalWeightText} onChange={(goalWeightText) => patch({ goalWeightText })} unit={draft.unit} />
      </Field>
      <HeightField heightIn={draft.heightIn} unit={draft.unit} onChange={(heightIn) => patch({ heightIn })} />
    </>
  );
}

export function ReadyStep({ draft }: StepProps) {
  const med = medFor({ medKey: draft.medKey, customMedName: draft.customMedName });
  return (
    <>
      <img className="onb-hero-art" src="/icon.svg" alt="" />
      <StepHeading
        title={
          <>
            You're all set{draft.name.trim() ? `, ${draft.name.trim()}` : ""} <span className="grad-text">🎉</span>
          </>
        }
        sub={`${med.brand} · ${draft.doseMg} mg every ${draft.scheduleDays} days. Here's how to get the most out of ShotMate:`}
      />
      <div className="card">
        <ul className="ready-tips">
          <li>💉 Log your first shot — you can backdate it if it was days ago.</li>
          <li>🔄 Follow the <strong>✦ next up</strong> tag to rotate injection sites.</li>
          <li>⚖️ Weigh in a few times a week — trends beat single days.</li>
          <li>📦 Your data stays on this device; export backups in Settings.</li>
        </ul>
      </div>
    </>
  );
}
