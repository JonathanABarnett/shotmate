import { useState } from "react";
import { DAY, startOfDay } from "../../lib/dates";
import { fuelVsPace } from "../../lib/insights";
import { calorieBudget, todayIntake } from "../../lib/intake";
import { calorieReply } from "../../lib/logReplies";
import { useStore } from "../../store/StoreProvider";
import Sheet from "../Sheet";
import SegmentedControl from "../SegmentedControl";
import { EntryBadge } from "../entryKinds";
import { Field } from "../form/fields";
import EntrySheetFooter from "../form/EntrySheetFooter";
import type { EntrySheetProps } from "./types";

const MAX_KCAL = 6000;

type DayKey = "today" | "yesterday";

const DAY_OPTIONS: { key: DayKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
];

/** Noon-ish of the chosen day — stepping back from local midnight keeps DST changeovers honest. */
const dayTs = (key: DayKey) => (key === "today" ? Date.now() : startOfDay(Date.now()) - DAY / 2);

/** The whole day's calories as one typed number — no per-food diary. */
export default function LogCaloriesSheet({ onClose, onDone }: EntrySheetProps) {
  const { data, dispatch } = useStore();
  const kcalFor = (key: DayKey) => todayIntake(data, dayTs(key))?.kcal ?? 0;
  const [day, setDay] = useState<DayKey>("today");
  const [draft, setDraft] = useState(() => (kcalFor("today") > 0 ? String(kcalFor("today")) : ""));
  const current = kcalFor(day);
  const budget = calorieBudget(data);
  const burn = fuelVsPace(data)?.impliedBurnKcal;
  const hint = budget
    ? `Your budget is ${budget} kcal — grab the day's total from Lose It.`
    : burn
      ? `Your own numbers say you burn about ${burn.toLocaleString()} kcal a day — grab the day's total from Lose It.`
      : "Grab the day's total from Lose It (or wherever you count).";
  const parsed = Math.round(Number(draft));
  const valid = draft.trim() !== "" && Number.isFinite(parsed) && parsed >= 0 && parsed <= MAX_KCAL;

  const pickDay = (key: DayKey) => {
    setDay(key);
    setDraft(kcalFor(key) > 0 ? String(kcalFor(key)) : "");
  };

  const save = () => {
    if (!valid) return;
    dispatch({ type: "addIntake", ts: dayTs(day), kcal: parsed - current });
    onDone(parsed > 0 ? calorieReply(data, dayTs(day)) : "Calories cleared");
    onClose();
  };

  return (
    <Sheet title={day === "today" ? "Today's calories" : "Yesterday's calories"} icon={<EntryBadge kind="calories" />} onClose={onClose}>
      <SegmentedControl ariaLabel="Which day" options={DAY_OPTIONS} value={day} onChange={pickDay} />
      <Field label="Day's total" hint={hint}>
        <input
          className="input"
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_KCAL}
          placeholder="e.g. 1650"
          aria-label="Calories for the day"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && valid && save()}
          autoFocus
        />
      </Field>
      <EntrySheetFooter saveLabel="Save" onSave={save} disabled={!valid} />
    </Sheet>
  );
}
