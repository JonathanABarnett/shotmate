import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { greeting } from "../lib/dates";

interface Props {
  name: string;
  /** one true encouraging sentence for today, when there is one */
  line?: string;
  inSettings: boolean;
  onToggleSettings: () => void;
}

function LogoMark() {
  return <img className="logo-mark" src="/icon.svg" alt="" />;
}

export default function TopBar({ name, line, inSettings, onToggleSettings }: Props) {
  return (
    <header className="topbar">
      <div className="who">
        <LogoMark />
        <div>
          <div className="greet-hi">{inSettings ? "ShotMate" : greeting()}</div>
          <div className="greet-name">{inSettings ? "Settings" : name ? `${name} 👋` : "Welcome 👋"}</div>
          {!inSettings && line && <div className="greet-line">{line}</div>}
        </div>
      </div>
      <button
        className="icon-btn"
        aria-label={inSettings ? "Back" : "Settings"}
        onClick={onToggleSettings}
      >
        {inSettings ? <ArrowLeft size={21} /> : <SettingsIcon size={21} />}
      </button>
    </header>
  );
}
