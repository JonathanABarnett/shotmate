import { useStore } from "../../store/StoreProvider";
import { DEFAULT_PROTEIN_GOAL_G, DEFAULT_WATER_GOAL_FL_OZ } from "../../lib/defaults";
import { Field } from "../../components/form/fields";
import UnitToggle from "../../components/form/UnitToggle";
import HeightField from "../../components/form/HeightField";
import OptionalNumberField from "../../components/form/OptionalNumberField";
import WeightSettingField from "./WeightSettingField";

export default function GoalsSection() {
  const { data, dispatch } = useStore();
  const { settings } = data;
  const unit = settings.unit;

  return (
    <section className="card">
      <Field label="Units">
        <UnitToggle value={unit} onChange={(u) => dispatch({ type: "updateSettings", patch: { unit: u } })} />
      </Field>
      <WeightSettingField
        key={`start-${unit}`}
        label="Starting weight"
        hint="Defaults to your first weigh-in if left blank."
        lbs={settings.startLbs}
        unit={unit}
        onChange={(startLbs) => dispatch({ type: "updateSettings", patch: { startLbs } })}
      />
      <WeightSettingField
        key={`goal-${unit}`}
        label="Goal weight"
        lbs={settings.goalLbs}
        unit={unit}
        onChange={(goalLbs) => dispatch({ type: "updateSettings", patch: { goalLbs } })}
      />
      <HeightField
        key={unit}
        heightIn={settings.heightIn}
        unit={unit}
        onChange={(heightIn) => dispatch({ type: "updateSettings", patch: { heightIn } })}
      />
      <OptionalNumberField
        label="Daily protein goal"
        suffix="g"
        placeholder={String(DEFAULT_PROTEIN_GOAL_G)}
        value={settings.proteinGoalG}
        onChange={(proteinGoalG) => dispatch({ type: "updateSettings", patch: { proteinGoalG } })}
        max={400}
      />
      <OptionalNumberField
        label="Daily water goal"
        hint="Both power the quick-log card on Home."
        suffix="fl oz"
        placeholder={String(DEFAULT_WATER_GOAL_FL_OZ)}
        value={settings.waterGoalFlOz}
        onChange={(waterGoalFlOz) => dispatch({ type: "updateSettings", patch: { waterGoalFlOz } })}
        max={400}
      />
    </section>
  );
}
