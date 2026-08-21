import { ArrowLeft, Printer } from "lucide-react";
import type { AppData } from "../../types";
import { fmtDay } from "../../lib/dates";
import { severityMeta } from "../../lib/effects";
import { fmtLength, lengthUnit, MEASURES, sortedMeasures } from "../../lib/measures";
import { medFor } from "../../lib/meds";
import { sortedShots } from "../../lib/shots";
import { siteLabel } from "../../lib/sites";
import { fmtVital, sortedVitals, VITALS } from "../../lib/vitals";
import { bmi, fmtWeight, goalProgress, latestWeight, sortedWeights, startWeightLbs, weeklyRate, toDisplayWeight } from "../../lib/weight";
import WeightChart from "../../components/charts/WeightChart";
import { useStore } from "../../store/StoreProvider";

const MAX_ROWS = 14;

function KeyStats({ data }: { data: AppData }) {
  const { settings } = data;
  const start = startWeightLbs(data);
  const current = latestWeight(data.weights)?.lbs;
  const rate = weeklyRate(data.weights);
  const currentBmi = current != null ? bmi(current, settings.heightIn) : undefined;
  const progress = goalProgress(data);

  const cells: { label: string; value: string }[] = [];
  if (start != null) cells.push({ label: "Starting weight", value: fmtWeight(start, settings.unit) });
  if (current != null) cells.push({ label: "Current weight", value: fmtWeight(current, settings.unit) });
  if (start != null && current != null)
    cells.push({ label: "Total change", value: `${current - start <= 0 ? "" : "+"}${toDisplayWeight(current - start, settings.unit).toFixed(1)} ${settings.unit}` });
  if (rate != null) cells.push({ label: "Recent pace", value: `${toDisplayWeight(rate, settings.unit).toFixed(1)} ${settings.unit}/wk` });
  if (currentBmi != null) cells.push({ label: "BMI", value: currentBmi.toFixed(1) });
  if (progress && settings.goalLbs != null)
    cells.push({ label: "Goal", value: `${fmtWeight(settings.goalLbs, settings.unit)} (${Math.round(progress.pct * 100)}%)` });

  return (
    <div className="report-stats">
      {cells.map((c) => (
        <div key={c.label}>
          <div className="report-stat-value">{c.value}</div>
          <div className="report-stat-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function ShotTable({ data }: { data: AppData }) {
  const shots = sortedShots(data.shots).slice(-MAX_ROWS).reverse();
  if (shots.length === 0) return null;
  return (
    <section className="report-section">
      <h2>Injections {data.shots.length > MAX_ROWS ? `(latest ${MAX_ROWS} of ${data.shots.length})` : ""}</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Dose</th>
            <th>Site</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {shots.map((s) => (
            <tr key={s.id}>
              <td>{fmtDay(s.ts)}</td>
              <td>{s.doseMg} mg</td>
              <td>{siteLabel(s.site)}</td>
              <td>{s.note ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function EffectTable({ data }: { data: AppData }) {
  const effects = [...data.effects].sort((a, b) => b.ts - a.ts).slice(0, MAX_ROWS);
  if (effects.length === 0) return null;
  return (
    <section className="report-section">
      <h2>Side effects</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Symptoms</th>
            <th>Intensity</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {effects.map((e) => (
            <tr key={e.id}>
              <td>{fmtDay(e.ts)}</td>
              <td>{e.effects.join(", ")}</td>
              <td>{severityMeta(e.severity).label}</td>
              <td>{e.note ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function MeasureTable({ data }: { data: AppData }) {
  const measures = sortedMeasures(data.measures).slice(-8);
  if (measures.length === 0) return null;
  const unit = lengthUnit(data.settings.unit);
  const usedKeys = MEASURES.filter((m) => measures.some((e) => e.valuesIn[m.key] != null));
  return (
    <section className="report-section">
      <h2>Body measurements ({unit})</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            {usedKeys.map((m) => (
              <th key={m.key}>{m.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {measures.map((e) => (
            <tr key={e.id}>
              <td>{fmtDay(e.ts)}</td>
              {usedKeys.map((m) => (
                <td key={m.key}>{e.valuesIn[m.key] != null ? fmtLength(e.valuesIn[m.key]!, data.settings.unit) : "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function VitalsTable({ data }: { data: AppData }) {
  const entries = sortedVitals(data.vitals).slice(-8);
  if (entries.length === 0) return null;
  const usedKeys = VITALS.filter((v) => entries.some((e) => e.values[v.key] != null));
  return (
    <section className="report-section">
      <h2>Labs &amp; vitals</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            {usedKeys.map((v) => (
              <th key={v.key}>
                {v.short} ({v.unit})
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td>{fmtDay(e.ts)}</td>
              {usedKeys.map((v) => (
                <td key={v.key}>{e.values[v.key] != null ? fmtVital(v.key, e.values[v.key]!).replace(/ .*$/, "") : "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function ReportView({ onBack }: { onBack: () => void }) {
  const { data } = useStore();
  const med = medFor(data.settings);
  const weights = sortedWeights(data.weights);

  return (
    <div className="report">
      <div className="report-toolbar no-print">
        <button className="btn btn-plain btn-sm" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
          <Printer size={16} /> Print / save PDF
        </button>
      </div>

      <header className="report-head">
        <h1>GLP-1 progress report{data.settings.name ? ` — ${data.settings.name}` : ""}</h1>
        <p>
          {med.brand} ({med.generic}) · {data.settings.plannedDoseMg} mg every {data.settings.scheduleDays} days ·
          generated {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} with
          ShotMate
        </p>
      </header>

      <KeyStats data={data} />

      {weights.length >= 2 && (
        <section className="report-section">
          <h2>Weight</h2>
          <WeightChart weights={data.weights} unit={data.settings.unit} goalLbs={data.settings.goalLbs} height={220} />
        </section>
      )}

      <ShotTable data={data} />
      <EffectTable data={data} />
      <MeasureTable data={data} />
      <VitalsTable data={data} />

      <footer className="report-foot">
        Self-reported tracking data from the ShotMate app — not a medical record. Medication-level figures are model
        estimates.
      </footer>
    </div>
  );
}
