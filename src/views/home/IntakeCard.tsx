import { Beef, GlassWater, Minus } from "lucide-react";
import type { AppData } from "../../types";
import { fmtWater, GLASS_FL_OZ, proteinGoal, todayIntake, waterGoalFlOz } from "../../lib/intake";
import { useStore } from "../../store/StoreProvider";

const PROTEIN_STEP_G = 5;

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

export default function IntakeCard({ data }: { data: AppData }) {
  const { dispatch } = useStore();
  const today = todayIntake(data);
  const protein = today?.proteinG ?? 0;
  const water = today?.waterFlOz ?? 0;
  const unit = data.settings.unit;

  const add = (proteinG?: number, waterFlOz?: number) => dispatch({ type: "addIntake", ts: Date.now(), proteinG, waterFlOz });

  return (
    <section className="card intake-card">
      <div className="card-title-row">
        <h3 className="card-title">Today's fuel</h3>
        <div className="card-sub">Drag or tap — protein keeps muscle on board</div>
      </div>
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
    </section>
  );
}
