import { Download, X } from "lucide-react";
import type { InstallPrompt } from "../hooks/useInstallPrompt";

interface Props {
  prompt: InstallPrompt;
  /** compact = a single line, for the onboarding footer */
  compact?: boolean;
}

/** "Install ShotMate" card shown when the browser is offering an install. */
export default function InstallBanner({ prompt, compact }: Props) {
  if (!prompt.canInstall) return null;

  if (compact) {
    return (
      <button className="btn btn-subtle btn-block btn-sm" onClick={() => void prompt.install()}>
        <Download size={16} /> Install ShotMate on this phone
      </button>
    );
  }

  return (
    <section className="card install-card">
      <div className="install-main">
        <img className="install-icon" src="/icon-192.png" alt="" />
        <div className="install-text">
          <div className="entry-title">Install ShotMate</div>
          <div className="entry-sub">One tap from your home screen, works offline, and it's what makes reminders possible.</div>
        </div>
        <button className="icon-btn icon-btn-sm" aria-label="Not now" onClick={prompt.dismiss}>
          <X size={17} />
        </button>
      </div>
      <div className="install-actions">
        <button className="btn btn-primary btn-sm" onClick={() => void prompt.install()}>
          <Download size={16} /> Install
        </button>
        <button className="btn btn-plain btn-sm" onClick={prompt.dismiss}>
          Not now
        </button>
      </div>
    </section>
  );
}
