import type { BodyType, ThemePref } from "../../types";
import { useStore } from "../../store/StoreProvider";
import { BODY_TYPES } from "../../lib/figure";
import { Field } from "../../components/form/fields";
import SegmentedControl from "../../components/SegmentedControl";

const THEME_OPTIONS: { key: ThemePref; label: string }[] = [
  { key: "auto", label: "Auto" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

type Orientation = "facing" | "mirror";
const ORIENTATION_OPTIONS: { key: Orientation; label: string }[] = [
  { key: "facing", label: "Facing me" },
  { key: "mirror", label: "As I look down" },
];

export default function AppearanceSection() {
  const { data, dispatch } = useStore();
  const { settings } = data;
  return (
    <section className="card">
      <Field label="Theme" hint="Auto follows your device setting.">
        <SegmentedControl
          ariaLabel="Theme"
          options={THEME_OPTIONS}
          value={settings.theme ?? "auto"}
          onChange={(theme) => dispatch({ type: "updateSettings", patch: { theme } })}
        />
      </Field>
      <Field label="Body figure" hint="Used by the body snapshot and the injection-site picker.">
        <SegmentedControl
          ariaLabel="Body figure"
          options={BODY_TYPES}
          value={(settings.bodyType ?? "neutral") as BodyType}
          onChange={(bodyType) => dispatch({ type: "updateSettings", patch: { bodyType } })}
        />
      </Field>
      <Field
        label="Injection-site map"
        hint="“As I look down” puts your left side on the left — the way you see yourself when injecting."
      >
        <SegmentedControl
          ariaLabel="Site map orientation"
          options={ORIENTATION_OPTIONS}
          value={settings.siteMapMirror ? "mirror" : "facing"}
          onChange={(value) => dispatch({ type: "updateSettings", patch: { siteMapMirror: value === "mirror" } })}
        />
      </Field>
    </section>
  );
}
