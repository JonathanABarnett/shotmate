import type { BodyType, HomeCardKey, ThemePref } from "../../types";
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

const HOME_CARDS: { key: HomeCardKey; label: string }[] = [
  { key: "checkin", label: "Daily check-in" },
  { key: "cycle", label: "This cycle" },
  { key: "intake", label: "Protein & water" },
  { key: "goal", label: "Goal & milestones" },
  { key: "photos", label: "Progress photos" },
];

export default function AppearanceSection() {
  const { data, dispatch } = useStore();
  const { settings } = data;
  const hidden = new Set(settings.hiddenHomeCards ?? []);

  const toggleCard = (key: HomeCardKey) => {
    const next = new Set(hidden);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    dispatch({ type: "updateSettings", patch: { hiddenHomeCards: [...next] } });
  };

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
      <Field label="Home cards" hint="Turn off what you don't use — logging and history keep working either way.">
        <div className="chip-row">
          {HOME_CARDS.map((c) => (
            <button
              key={c.key}
              className={`chip${hidden.has(c.key) ? "" : " active"}`}
              aria-pressed={!hidden.has(c.key)}
              onClick={() => toggleCard(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Field>
    </section>
  );
}
