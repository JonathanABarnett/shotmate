import { useState } from "react";
import type { AppData } from "../../types";
import type { SyncState } from "../../sync/useSync";
import { uid } from "../../lib/ids";
import { crossedMilestone, type Milestone } from "../../lib/milestones";
import { crossedTapeMilestone } from "../../lib/tapeMilestones";
import { topNudge } from "../../lib/nudges";
import { monthStory } from "../../lib/story";
import { dismissRecap, weeklyRecap } from "../../lib/weeklyRecap";
import { markWinSuggestionHandled, suggestedWin } from "../../lib/winSuggestions";
import { useStore } from "../../store/StoreProvider";
import CelebrationCard from "./CelebrationCard";
import StoryCard from "./StoryCard";
import RecapCard from "./RecapCard";
import WinSuggestCard from "./WinSuggestCard";
import NudgeHost from "./NudgeHost";

interface Props {
  data: AppData;
  sync: SyncState;
  showToast: (message: string) => void;
  onOpenSettings: () => void;
  onLogMeasure: () => void;
  onLogPhoto: () => void;
}

/**
 * One spotlight at a time: celebration, then story, then the Sunday letter, then a win suggestion, then a nudge —
 * except a vial about to expire, which outranks everything but a celebration.
 */
export default function HomeSpotlight({ data, sync, showToast, onOpenSettings, onLogMeasure, onLogPhoto }: Props) {
  const { dispatch } = useStore();
  const [, setBumped] = useState(0);
  const refresh = () => setBumped((n) => n + 1);
  const saveWin = (text: string) =>
    dispatch({ type: "upsert", collection: "wins", item: { id: uid(), ts: Date.now(), text } });

  const celebrate = (m: Milestone) => {
    const markSeen = () => dispatch({ type: "markAchievementsSeen", keys: [m.key] });
    return (
      <CelebrationCard
        milestone={m}
        onSaveWin={() => {
          saveWin(m.winText);
          markSeen();
          showToast("Saved to your wins 🎉");
        }}
        onDone={() => {
          markSeen();
          showToast("Onward 💜");
        }}
      />
    );
  };
  // the scale first, then the tape — one party at a time
  const milestone = crossedMilestone(data) ?? crossedTapeMilestone(data);
  if (milestone) return celebrate(milestone);

  const nudgeHost = <NudgeHost data={data} sync={sync} showToast={showToast} onOpenSettings={onOpenSettings} onLogMeasure={onLogMeasure} onLogPhoto={onLogPhoto} />;
  if (topNudge(data, Boolean(sync.userId))?.key === "bud") return nudgeHost;

  const story = monthStory(data);
  if (story) {
    const markSeen = () => dispatch({ type: "markAchievementsSeen", keys: [story.key] });
    return (
      <StoryCard
        story={story}
        onSaveWin={() => {
          saveWin(story.winText);
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

  const recap = weeklyRecap(data);
  if (recap) {
    return (
      <RecapCard
        recap={recap}
        onDismiss={() => {
          dismissRecap(recap.key);
          refresh();
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

  return nudgeHost;
}
