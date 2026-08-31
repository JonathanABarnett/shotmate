import { useState } from "react";
import type { AppData } from "../../types";
import { getSupabase } from "../../sync/supabaseClient";
import { enableReminders } from "../../sync/pushReminders";
import { scheduleFor, type SyncState } from "../../sync/useSync";
import { snoozeNudge, topNudge } from "../../lib/nudges";
import { downloadBackup } from "../../store/backup";
import NudgeCard from "../../components/NudgeCard";

interface Props {
  data: AppData;
  sync: SyncState;
  showToast: (message: string) => void;
  onOpenSettings: () => void;
  onLogMeasure: () => void;
  onLogPhoto: () => void;
}

/** Picks the one nudge worth showing and carries out its action. */
export default function NudgeHost({ data, sync, showToast, onOpenSettings, onLogMeasure, onLogPhoto }: Props) {
  const [, setBumped] = useState(0);
  const refresh = () => setBumped((n) => n + 1);
  const nudge = topNudge(data, Boolean(sync.userId));
  if (!nudge) return null;

  const enable = async () => {
    const sb = getSupabase();
    if (!sb || !sync.userId) {
      onOpenSettings();
      return;
    }
    try {
      await enableReminders(sb, sync.userId, scheduleFor(data));
      showToast("Reminders on — the evening before and on shot day 💜");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't enable reminders");
    }
    refresh();
  };

  const saveBackup = async () => {
    await downloadBackup(data);
    showToast("Backup saved to your downloads 📦");
    refresh();
  };

  const act = () => {
    if (nudge.key === "setup") onOpenSettings();
    else if (nudge.key === "tape") onLogMeasure();
    else if (nudge.key === "photo") onLogPhoto();
    else if (nudge.key === "backup") void saveBackup();
    else void enable();
  };

  const dismiss = () => {
    snoozeNudge(nudge.key, nudge.key === "tape" || nudge.key === "photo" ? 5 : 30);
    refresh();
  };

  return <NudgeCard nudge={nudge} onAction={act} onDismiss={dismiss} />;
}
