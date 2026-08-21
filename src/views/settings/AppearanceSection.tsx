import type { ThemePref } from "../../types";
import { useStore } from "../../store/StoreProvider";
import { Field } from "../../components/form/fields";
import SegmentedControl from "../../components/SegmentedControl";

const OPTIONS: { key: ThemePref; label: string }[] = [
  { key: "auto", label: "Auto" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

export default function AppearanceSection() {
  const { data, dispatch } = useStore();
  return (
    <section className="card">
      <Field label="Theme" hint="Auto follows your device setting.">
        <SegmentedControl
          ariaLabel="Theme"
          options={OPTIONS}
          value={data.settings.theme ?? "auto"}
          onChange={(theme) => dispatch({ type: "updateSettings", patch: { theme } })}
        />
      </Field>
    </section>
  );
}
