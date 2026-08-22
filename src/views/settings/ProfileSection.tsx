import { useStore } from "../../store/StoreProvider";
import { Field } from "../../components/form/fields";

export default function ProfileSection() {
  const { data, dispatch } = useStore();
  return (
    <section className="card">
      <Field label="Your name" hint="Just for the friendly hello.">
        <input
          className="input"
          placeholder="What should we call you?"
          value={data.settings.name}
          onChange={(e) => dispatch({ type: "updateSettings", patch: { name: e.target.value } })}
        />
      </Field>
    </section>
  );
}
