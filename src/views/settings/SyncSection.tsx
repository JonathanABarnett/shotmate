import { useState } from "react";
import { Bell, BellOff, Cloud, LogOut, RefreshCw } from "lucide-react";
import { useStore } from "../../store/StoreProvider";
import { fmtTime } from "../../lib/dates";
import { Field } from "../../components/form/fields";
import { getSupabase } from "../../sync/supabaseClient";
import { disableReminders, enableReminders, isPushSupported, remindersWanted } from "../../sync/pushReminders";
import { scheduleFor, type SyncState } from "../../sync/useSync";

interface Props {
  sync: SyncState;
  showToast: (message: string) => void;
}

function SignInForm({ sync, showToast }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const send = async () => {
    try {
      await sync.signIn(email.trim());
      setSent(true);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't send the link");
    }
  };
  return (
    <>
      <p className="field-hint" style={{ marginBottom: 12 }}>
        Sign in once on each device to keep your history in sync and to get shot-day reminders. No password — you'll
        get a magic link by email.
      </p>
      {sent ? (
        <p className="callout info">📬 Check your email and tap the link — this page picks it up automatically.</p>
      ) : (
        <Field label="Email">
          <div className="input-row">
            <input className="input" type="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn btn-primary btn-sm" disabled={!/\S+@\S+\.\S+/.test(email)} onClick={send}>
              Send link
            </button>
          </div>
        </Field>
      )}
    </>
  );
}

function RemindersRow({ sync, showToast }: Props) {
  const { data } = useStore();
  const [on, setOn] = useState(remindersWanted());
  const [busy, setBusy] = useState(false);
  const sb = getSupabase();
  if (!sb || !sync.userId) return null;
  const supported = isPushSupported();

  const toggle = async () => {
    setBusy(true);
    try {
      if (on) {
        await disableReminders(sb);
        setOn(false);
        showToast("Shot-day reminders off");
      } else {
        await enableReminders(sb, sync.userId!, scheduleFor(data));
        setOn(true);
        showToast("Reminders on — the evening before and on shot day 💜");
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't change reminders");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sync-row">
      <span className={`entry-ico ${on ? "violet" : "gold"}`}>{on ? <Bell size={19} /> : <BellOff size={19} />}</span>
      <span className="sync-main">
        <div className="entry-title">Shot-day reminders on this device</div>
        <div className="entry-sub">
          {supported ? "The evening before and the morning of — even with the app closed." : "This browser can't receive push notifications."}
        </div>
      </span>
      <button className={`switch${on ? " on" : ""}`} role="switch" aria-checked={on} aria-label="Shot-day reminders" disabled={busy || !supported} onClick={toggle} />
    </div>
  );
}

function statusLine(sync: SyncState): string {
  if (sync.status === "syncing") return "Syncing…";
  if (sync.status === "error") return `Sync problem: ${sync.error}`;
  if (sync.lastSyncAt) return `Last synced ${fmtTime(sync.lastSyncAt)} · photos stay on each device`;
  return "Connected";
}

export default function SyncSection({ sync, showToast }: Props) {
  if (sync.status === "unconfigured") {
    return (
      <section className="card">
        <p className="field-hint">This build runs fully offline — sync and reminders aren't configured.</p>
      </section>
    );
  }
  return (
    <section className="card">
      {sync.userId ? (
        <>
          <div className="sync-row">
            <span className="entry-ico teal">
              <Cloud size={19} />
            </span>
            <span className="sync-main">
              <div className="entry-title">Synced as {sync.email}</div>
              <div className="entry-sub">{statusLine(sync)}</div>
            </span>
            <button className="icon-btn icon-btn-sm" aria-label="Sync now" onClick={() => void sync.syncNow()}>
              <RefreshCw size={17} />
            </button>
          </div>
          <RemindersRow sync={sync} showToast={showToast} />
          <div className="spacer-8" />
          <button className="btn btn-plain btn-block btn-sm" onClick={() => void sync.signOut()}>
            <LogOut size={15} /> Sign out on this device
          </button>
        </>
      ) : (
        <SignInForm sync={sync} showToast={showToast} />
      )}
    </section>
  );
}
