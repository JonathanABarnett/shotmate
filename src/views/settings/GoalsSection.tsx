import { useStore } from "../../store/StoreProvider";
import { Field } from "../../components/form/fields";
import UnitToggle from "../../components/form/UnitToggle";
import HeightField from "../../components/form/HeightField";
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
        heightIn={settings.heightIn}
        unit={unit}
        onChange={(heightIn) => dispatch({ type: "updateSettings", patch: { heightIn } })}
      />
    </section>
  );
}
