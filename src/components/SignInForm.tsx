import { useState } from "react";
import { Field } from "./form/fields";

interface Props {
  onSend: (email: string) => Promise<void>;
  intro?: string;
}

/** Email → magic link. Shows its own "check your email" and error states. */
export default function SignInForm({ onSend, intro }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();
  const valid = /\S+@\S+\.\S+/.test(email);

  const send = async () => {
    setError(undefined);
    try {
      await onSend(email.trim());
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send the link");
    }
  };

  if (sent) return <p className="callout info">📬 Check your email and tap the link — this page picks it up automatically.</p>;

  return (
    <>
      {intro && <p className="field-hint" style={{ marginBottom: 12 }}>{intro}</p>}
      <Field label="Email" hint={error}>
        <div className="input-row">
          <input className="input" type="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn btn-primary btn-sm" disabled={!valid} onClick={send}>
            Send link
          </button>
        </div>
      </Field>
    </>
  );
}
