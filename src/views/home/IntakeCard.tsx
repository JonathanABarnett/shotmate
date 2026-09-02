import { useRef, useState } from "react";
import { Beef, Flame, GlassWater, Minus, Upload } from "lucide-react";
import type { AppData } from "../../types";
import { calorieBudget, fmtWater, GLASS_FL_OZ, proteinGoal, todayIntake, waterGoalFlOz } from "../../lib/intake";
import { parseLoseItCsv } from "../../lib/loseItImport";
import { useStore } from "../../store/StoreProvider";

const PROTEIN_STEP_G = 5;

/** One-tap foods — close-enough grams beat a food diary nobody keeps. */
const FOODS: { label: string; grams: number }[] = [
  { label: "🥤 Shake", grams: 25 },
  { label: "🍗 Chicken", grams: 30 },
  { label: "🥩 Palm of meat", grams: 25 },
  { label: "🥣 Greek yogurt", grams: 17 },
  { label: "🥚 2 eggs", grams: 12 },
  { label: "🧀 Cheese stick", grams: 7 },
];

interface MeterRowProps {
  icon: React.ReactNode;
  tone: "coral" | "teal";
  label: string;
  valueText: string;
  value: number;
  goal: number;
  step: number;
  onSet: (value: number) => void;
  actions: React.ReactNode;
}

/** Label, draggable slider (fill = progress to goal), and quick-add buttons. */
function MeterRow({ icon, tone, label, valueText, value, goal, step, onSet, actions }: MeterRowProps) {
  const max = Math.max(goal * 1.5, value, step);
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="intake-row">
      <span className={`entry-ico ${tone}`}>{icon}</span>
      <div className="intake-main">
        <div className="row-between">
          <span className="intake-label">{label}</span>
          <span className="intake-value">{valueText}</span>
        </div>
        <input
          type="range"
          className={`intake-slider ${tone}`}
          min={0}
          max={max}
          step={step}
          value={value}
          aria-label={`${label} today`}
          style={{ "--pct": `${pct}%`, "--goal": `${Math.min(100, (goal / max) * 100)}%` } as React.CSSProperties}
          onChange={(e) => onSet(Number(e.target.value))}
        />
      </div>
      <div className="intake-actions">{actions}</div>
    </div>
  );
}

/** The day's calorie total — entered via the + menu's Calories sheet; this row just shows it. */
function CaloriesRow({ kcal, budget, onEdit }: { kcal: number; budget?: number; onEdit: () => void }) {
  return (
    <div className="intake-row">
      <span className="entry-ico gold">
        <Flame size={19} />
      </span>
      <div className="intake-main">
        <div className="row-between">
          <span className="intake-label">Calories</span>
          <span className="intake-value">{kcal > 0 ? `${kcal}${budget ? ` / ${budget}` : ""} kcal` : "not logged yet"}</span>
        </div>
      </div>
      <div className="intake-actions">
        <button className="intake-btn" onClick={onEdit}>
          {kcal > 0 ? "Edit" : "Add"}
        </button>
      </div>
    </div>
  );
}

export default function IntakeCard({ data, onLogCalories }: { data: AppData; onLogCalories: () => void }) {
  const { dispatch } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importNote, setImportNote] = useState<string | null>(null);
  const today = todayIntake(data);
  const protein = today?.proteinG ?? 0;
  const water = today?.waterFlOz ?? 0;
  const kcal = today?.kcal ?? 0;

  const add = (proteinG?: number, waterFlOz?: number) => dispatch({ type: "addIntake", ts: Date.now(), proteinG, waterFlOz });

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    const parsed = parseLoseItCsv(await file.text());
    if (parsed && parsed.days.length > 0) {
      dispatch({ type: "importIntake", days: parsed.days });
      setImportNote(`Imported ${parsed.days.length} day${parsed.days.length === 1 ? "" : "s"} from Lose It 📥`);
    } else {
      setImportNote("That doesn't look like a Lose It export");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const caloriesOnly = data.settings.calorieOnlyFuel ?? false;

  return (
    <section className="card intake-card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Today's fuel</h3>
          <div className="card-sub">
            {importNote ?? (caloriesOnly ? "One number a day, straight from Lose It" : "Protein keeps muscle on board; calories can come straight from Lose It")}
          </div>
        </div>
        <button className="link-btn" onClick={() => fileRef.current?.click()}>
          <Upload size={14} /> Import
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => handleImport(e.target.files?.[0])} />
      </div>
      {caloriesOnly ? (
        <CaloriesRow kcal={kcal} budget={calorieBudget(data)} onEdit={onLogCalories} />
      ) : (
        <FullIntakeRows data={data} protein={protein} water={water} kcal={kcal} add={add} onLogCalories={onLogCalories} />
      )}
    </section>
  );
}

interface FullRowsProps {
  data: AppData;
  protein: number;
  water: number;
  kcal: number;
  add: (proteinG?: number, waterFlOz?: number) => void;
  onLogCalories: () => void;
}

/** The classic three-meter layout — protein chips, calories, water. */
function FullIntakeRows({ data, protein, water, kcal, add, onLogCalories }: FullRowsProps) {
  const unit = data.settings.unit;
  return (
    <>
      <MeterRow
        icon={<Beef size={19} />}
        tone="coral"
        label="Protein"
        valueText={`${Math.round(protein)} / ${proteinGoal(data)} g`}
        value={protein}
        goal={proteinGoal(data)}
        step={PROTEIN_STEP_G}
        onSet={(v) => add(v - protein, 0)}
        actions={
          <>
            <button className="intake-btn" onClick={() => add(10, 0)}>
              +10
            </button>
            <button className="intake-btn" onClick={() => add(25, 0)}>
              +25
            </button>
            <button className="intake-btn ghost" aria-label="Remove 10 g protein" onClick={() => add(-10, 0)}>
              <Minus size={14} />
            </button>
          </>
        }
      />
      <div className="chip-row food-row">
        {FOODS.map((f) => (
          <button key={f.label} className="chip food-chip" aria-label={`Add ${f.grams} g — ${f.label}`} onClick={() => add(f.grams, 0)}>
            {f.label} <strong>+{f.grams}</strong>
          </button>
        ))}
      </div>
      <p className="field-hint food-hint">
        No food diary needed — tap what you ate. A palm-sized portion ≈ 25 g; four palms across the day lands near your goal.
      </p>
      <CaloriesRow kcal={kcal} budget={calorieBudget(data)} onEdit={onLogCalories} />
      <MeterRow
        icon={<GlassWater size={19} />}
        tone="teal"
        label="Water"
        valueText={`${fmtWater(water, unit)} / ${fmtWater(waterGoalFlOz(data), unit)}`}
        value={water}
        goal={waterGoalFlOz(data)}
        step={GLASS_FL_OZ / 2}
        onSet={(v) => add(0, v - water)}
        actions={
          <>
            <button className="intake-btn" onClick={() => add(0, GLASS_FL_OZ)}>
              +🥛
            </button>
            <button className="intake-btn ghost" aria-label="Remove one glass" onClick={() => add(0, -GLASS_FL_OZ)}>
              <Minus size={14} />
            </button>
          </>
        }
      />
    </>
  );
}
