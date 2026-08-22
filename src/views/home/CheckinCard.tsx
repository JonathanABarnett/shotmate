import type { AppData, Scale5 } from "../../types";
import { ENERGY_LABELS, HUNGER_LABELS, SCALE, SLEEP_LABELS, todayCheckin } from "../../lib/checkin";
import { cycleOffsetDays } from "../../lib/insights/shared";
import { useStore } from "../../store/StoreProvider";

type Tone = "hunger" | "energy" | "sleep";

interface ScaleRowProps {
  label: string;
  emoji: string;
  tone: Tone;
  value?: Scale5;
  labels: Record<Scale5, string>;
  onPick: (value: Scale5) => void;
}

function ScaleRow({ label, emoji, tone, value, labels, onPick }: ScaleRowProps) {
  return (
    <div className="checkin-row">
      <div className="row-between">
        <span className="checkin-label">
          {emoji} {label}
        </span>
        <span className="scale-value">{value ? labels[value] : "tap to rate"}</span>
      </div>
      <div className="scale-dots" role="radiogroup" aria-label={label}>
        {SCALE.map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={value === n}
            aria-label={`${label} ${n}: ${labels[n]}`}
            className={`scale-dot ${tone}${value === n ? " active" : ""}`}
            onClick={() => onPick(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Three taps a day — the inputs behind the hunger-creep and sleep insights. */
export default function CheckinCard({ data }: { data: AppData }) {
  const { dispatch } = useStore();
  const today = todayCheckin(data);
  const offset = cycleOffsetDays(Date.now(), data.shots);
  const set = (patch: { hunger?: Scale5; energy?: Scale5; sleep?: Scale5 }) =>
    dispatch({ type: "setCheckin", ts: Date.now(), ...patch });

  return (
    <section className="card checkin-card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">How's today?</h3>
          <div className="card-sub">Three taps — hunger, energy, and how you slept last night</div>
        </div>
        {offset != null && <span className="pill-note violet">cycle day {offset + 1}</span>}
      </div>
      <ScaleRow label="Hunger" emoji="🍽️" tone="hunger" value={today?.hunger} labels={HUNGER_LABELS} onPick={(hunger) => set({ hunger })} />
      <ScaleRow label="Energy" emoji="⚡" tone="energy" value={today?.energy} labels={ENERGY_LABELS} onPick={(energy) => set({ energy })} />
      <ScaleRow label="Sleep" emoji="😴" tone="sleep" value={today?.sleep} labels={SLEEP_LABELS} onPick={(sleep) => set({ sleep })} />
    </section>
  );
}
