import { useEffect } from "react";

export const LAUNCH_ACTIONS = ["shot", "weight", "effect", "measure", "activity", "photo", "win", "checkin"] as const;
export type LaunchAction = (typeof LAUNCH_ACTIONS)[number];

function isLaunchAction(value: string | null): value is LaunchAction {
  return LAUNCH_ACTIONS.includes(value as LaunchAction);
}

/**
 * Home-screen shortcuts and notifications open the app with `?action=…`.
 * Fires the handler once on launch, then removes the param from the URL.
 */
export function useLaunchAction(onAction: (action: LaunchAction) => void) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    if (!isLaunchAction(action)) return;
    params.delete("action");
    const search = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
    onAction(action);
    // run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
