import { useRef } from "react";
import { Download, Sparkles, Upload } from "lucide-react";
import { useStore } from "../../store/StoreProvider";
import { downloadBackup, parseBackupFile } from "../../store/backup";
import ConfirmButton from "../../components/ConfirmButton";

interface Props {
  showToast: (message: string) => void;
  /** signed in and syncing — changes the advice below */
  synced: boolean;
}

export default function DataSection({ showToast, synced }: Props) {
  const { data, dispatch } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const hasEntries = data.shots.length + data.weights.length + data.effects.length > 0;

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    const imported = await parseBackupFile(file);
    if (imported) {
      dispatch({ type: "importData", data: imported });
      showToast("Backup restored 🎉");
    } else {
      showToast("That file doesn't look like a ShotMate backup");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <section className="card">
      <button
        className="btn btn-subtle btn-block btn-sm"
        onClick={() => {
          downloadBackup(data);
          showToast("Backup downloaded 📦");
        }}
      >
        <Download size={16} /> Export backup (JSON)
      </button>
      <div className="spacer-8" />
      <button className="btn btn-subtle btn-block btn-sm" onClick={() => fileRef.current?.click()}>
        <Upload size={16} /> Import backup
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => handleImport(e.target.files?.[0])}
      />
      <div className="spacer-8" />
      <ConfirmButton
        className="btn btn-plain btn-block btn-sm"
        label={
          <>
            <Sparkles size={16} /> Load sample data
          </>
        }
        confirmLabel={hasEntries ? "Replaces your current data — tap again" : "Tap again to load the demo"}
        onConfirm={() => {
          dispatch({ type: "loadSample" });
          showToast("Sample data loaded ✨");
        }}
      />
      <div className="spacer-8" />
      <ConfirmButton
        label="Erase all data"
        confirmLabel="Tap again — this erases everything"
        onConfirm={() => {
          dispatch({ type: "wipe" });
          showToast("All data erased");
        }}
      />
      <p className="field-hint" style={{ marginTop: 12 }}>
        {synced
          ? "Your history is synced to your account (photos excluded) — still export a backup before clearing browser data, since photos live only here."
          : "Everything lives in this browser only until you sign in under Sync & reminders. Export a backup before switching devices or clearing browser data."}
      </p>
    </section>
  );
}
