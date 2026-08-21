import { Beef, GlassWater, Minus } from "lucide-react";
import type { AppData } from "../../types";
import { fmtWater, GLASS_FL_OZ, proteinGoal, todayIntake, waterGoalFlOz } from "../../lib/intake";
import { useStore } from "../../store/StoreProvider";

interface MeterRowProps {
  icon: React.ReactNode;
  tone: "coral" | "teal";
  label: string;
  valueText: string;
  pct: number;
  actions: React.ReactNode;
}

function MeterRow({ icon, tone, label, valueText, pct, actions }: MeterRowProps) {
  return (
    <div className="intake-row">
      <span className={`entry-ico ${tone}`}>{icon}</span>
      <div className="intake-main">
        <div className="row-between">
          <span className="intake-label">{label}</span>
          <span className="intake-value">{valueText}</span>
        </div>
        <div className={`meter-track ${tone}`}>
          <div className="meter-fill" style={{ width: `${Math.min(100, pct * 100)}%` }} />
        </div>
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

  const add = (proteinG?: number, waterFlOz?: number) =>
    dispatch({ type: "addIntake", ts: Date.now(), proteinG, waterFlOz });

  return (
    <section className="card intake-card">
      <div className="card-title-row">
        <h3 className="card-title">Today's fuel</h3>
        <div className="card-sub">Protein keeps muscle on board</div>
      </div>
      <MeterRow
        icon={<Beef size={19} />}
        tone="coral"
        label="Protein"
        valueText={`${Math.round(protein)} / ${proteinGoal(data)} g`}
        pct={protein / proteinGoal(data)}
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
        pct={water / waterGoalFlOz(data)}
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
