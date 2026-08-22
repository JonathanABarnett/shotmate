import { useState } from "react";
import type { AppData, CheckinSlot, Scale5 } from "../../types";
import { ENERGY_LABELS, HUNGER_LABELS, SCALE, SLEEP_LABELS, SLOTS, slotFor, todayCheckin } from "../../lib/checkin";
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

interface SlotTabsProps {
  value: CheckinSlot;
  current: CheckinSlot;
  filled: (slot: CheckinSlot) => boolean;
  onChange: (slot: CheckinSlot) => void;
}

/** Morning / afternoon / evening — the current one is preselected; later ones wait their turn. */
function SlotTabs({ value, current, filled, onChange }: SlotTabsProps) {
  const order = SLOTS.map((s) => s.key);
  return (
    <div className="chip-row slot-row" role="tablist" aria-label="Time of day">
      {SLOTS.map((s) => (
        <button
          key={s.key}
          role="tab"
          aria-selected={value === s.key}
          disabled={order.indexOf(s.key) > order.indexOf(current)}
          className={`chip slot-chip${value === s.key ? " active" : ""}`}
          onClick={() => onChange(s.key)}
        >
          {s.emoji} {s.label}
          {filled(s.key) && <span className="slot-check"> ✓</span>}
        </button>
      ))}
    </div>
  );
}

/** Hunger & energy per part of the day, sleep once — the inputs behind the cycle, sleep, and time-of-day insights. */
export default function CheckinCard({ data }: { data: AppData }) {
  const { dispatch } = useStore();
  const now = Date.now();
  const today = todayCheckin(data, now);
  const current = slotFor(now);
  const [slot, setSlot] = useState<CheckinSlot>(current);
  const moment = today?.slots?.[slot];
  const offset = cycleOffsetDays(now, data.shots);
  const filled = (key: CheckinSlot) => today?.slots?.[key]?.hunger != null || today?.slots?.[key]?.energy != null;
  const set = (patch: { hunger?: Scale5; energy?: Scale5; sleep?: Scale5 }) =>
    dispatch({ type: "setCheckin", ts: now, slot, ...patch });

  return (
    <section className="card checkin-card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">How's today?</h3>
          <div className="card-sub">Hunger &amp; energy for each part of the day, sleep once</div>
        </div>
        {offset != null && <span className="pill-note violet">cycle day {offset + 1}</span>}
      </div>
      <SlotTabs value={slot} current={current} filled={filled} onChange={setSlot} />
      <ScaleRow label="Hunger" emoji="🍽️" tone="hunger" value={moment?.hunger} labels={HUNGER_LABELS} onPick={(hunger) => set({ hunger })} />
      <ScaleRow label="Energy" emoji="⚡" tone="energy" value={moment?.energy} labels={ENERGY_LABELS} onPick={(energy) => set({ energy })} />
      <ScaleRow label="Sleep (last night)" emoji="😴" tone="sleep" value={today?.sleep} labels={SLEEP_LABELS} onPick={(sleep) => set({ sleep })} />
    </section>
  );
}
