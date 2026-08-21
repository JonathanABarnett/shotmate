import { useCallback, useEffect, useState } from "react";

/** Chrome's non-standard install event (not in lib.dom). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "shotmate-install-dismissed-at";
const SNOOZE_DAYS = 14;

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const recentlyDismissed = () => {
  const at = Number(localStorage.getItem(DISMISSED_KEY) ?? 0);
  return at > 0 && Date.now() - at < SNOOZE_DAYS * 86_400_000;
};

export interface InstallPrompt {
  /** the browser is offering an install and we haven't been snoozed */
  canInstall: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
}

/**
 * Capture the browser's "add to home screen" offer so the app can present its
 * own Install button. Silent when already installed, unsupported (iOS), or snoozed.
 */
export function useInstallPrompt(): InstallPrompt {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(() => isStandalone() || recentlyDismissed());

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setHidden(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === "accepted") setHidden(true);
  }, [deferred]);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setHidden(true);
  }, []);

  return { canInstall: !!deferred && !hidden, install, dismiss };
}
