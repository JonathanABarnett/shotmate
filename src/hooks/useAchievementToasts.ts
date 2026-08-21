import { useEffect } from "react";
import type { AppData } from "../types";
import { achievements, newlyEarned } from "../lib/achievements";
import type { Action } from "../store/reducer";

/**
 * Celebrate newly earned badges with a toast, one at a time, and remember them.
 * When nothing has ever been marked seen but several are already earned (existing
 * data, an import, demo mode), mark them quietly instead of firing a parade of toasts.
 * Written to be idempotent so StrictMode's double effect run is harmless.
 */
export function useAchievementToasts(data: AppData, showToast: (message: string) => void, dispatch: (a: Action) => void) {
  useEffect(() => {
    if (!data.onboarded) return;
    const fresh = newlyEarned(achievements(data), data.seenAchievements);
    if (fresh.length === 0) return;

    if (data.seenAchievements.length === 0 && fresh.length > 1) {
      dispatch({ type: "markAchievementsSeen", keys: fresh.map((a) => a.key) });
      return;
    }
    const next = fresh[0];
    showToast(`${next.emoji} Unlocked: ${next.title}`);
    dispatch({ type: "markAchievementsSeen", keys: [next.key] });
  }, [data, showToast, dispatch]);
}
