import { useState } from "react";
import type { AppData } from "../../types";
import { getSupabase } from "../../sync/supabaseClient";
import { enableReminders } from "../../sync/pushReminders";
import { scheduleFor, type SyncState } from "../../sync/useSync";
import { snoozeNudge, topNudge } from "../../lib/nudges";
import NudgeCard from "../../components/NudgeCard";

interface Props {
  data: AppData;
  sync: SyncState;
  showToast: (message: string) => void;
  onOpenSettings: () => void;
  onLogMeasure: () => void;
}

/** Picks the one nudge worth showing and carries out its action. */
export default function NudgeHost({ data, sync, showToast, onOpenSettings, onLogMeasure }: Props) {
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

  const act = () => {
    if (nudge.key === "setup") onOpenSettings();
    else if (nudge.key === "tape") onLogMeasure();
    else void enable();
  };

  const dismiss = () => {
    snoozeNudge(nudge.key, nudge.key === "tape" ? 14 : 30);
    refresh();
  };

  return <NudgeCard nudge={nudge} onAction={act} onDismiss={dismiss} />;
}
