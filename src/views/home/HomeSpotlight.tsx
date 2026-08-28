import { useState } from "react";
import type { AppData } from "../../types";
import type { SyncState } from "../../sync/useSync";
import { uid } from "../../lib/ids";
import { crossedMilestone } from "../../lib/milestones";
import { markWinSuggestionHandled, suggestedWin } from "../../lib/winSuggestions";
import { useStore } from "../../store/StoreProvider";
import CelebrationCard from "./CelebrationCard";
import WinSuggestCard from "./WinSuggestCard";
import NudgeHost from "./NudgeHost";

interface Props {
  data: AppData;
  sync: SyncState;
  showToast: (message: string) => void;
  onOpenSettings: () => void;
  onLogMeasure: () => void;
}

/** One spotlight at a time: celebrate first, suggest a win second, nudge last. */
export default function HomeSpotlight({ data, sync, showToast, onOpenSettings, onLogMeasure }: Props) {
  const { dispatch } = useStore();
  const [, setBumped] = useState(0);
  const refresh = () => setBumped((n) => n + 1);
  const saveWin = (text: string) =>
    dispatch({ type: "upsert", collection: "wins", item: { id: uid(), ts: Date.now(), text } });

  const milestone = crossedMilestone(data);
  if (milestone) {
    const markSeen = () => dispatch({ type: "markAchievementsSeen", keys: [milestone.key] });
    return (
      <CelebrationCard
        milestone={milestone}
        onSaveWin={() => {
          saveWin(milestone.winText);
          markSeen();
          showToast("Saved to your wins 🎉");
        }}
        onDone={() => {
          markSeen();
          showToast("Onward 💜");
        }}
      />
    );
  }

  const suggestion = suggestedWin(data);
  if (suggestion) {
    return (
      <WinSuggestCard
        suggestion={suggestion}
        onSave={() => {
          saveWin(suggestion.text);
          markWinSuggestionHandled(suggestion.key);
          showToast("Saved to your wins 🎉");
          refresh();
        }}
        onSkip={() => {
          markWinSuggestionHandled(suggestion.key);
          refresh();
        }}
      />
    );
  }

  return <NudgeHost data={data} sync={sync} showToast={showToast} onOpenSettings={onOpenSettings} onLogMeasure={onLogMeasure} />;
}
