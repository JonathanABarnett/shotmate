import { useState } from "react";
import type { Entry } from "./types";
import { useStore } from "./store/StoreProvider";
import { Toast, useToast } from "./hooks/useToast";
import TopBar from "./components/TopBar";
import Dock, { type Tab } from "./components/Dock";
import SheetRouter from "./components/sheets/SheetRouter";
import type { ActiveSheet } from "./components/sheets/types";
import OnboardingView from "./views/onboarding/OnboardingView";
import HomeView from "./views/home/HomeView";
import TrendsView from "./views/trends/TrendsView";
import HistoryView from "./views/history/HistoryView";
import HelpView from "./views/help/HelpView";
import SettingsView from "./views/settings/SettingsView";

function sheetForEntry(entry: Entry): ActiveSheet {
  switch (entry.kind) {
    case "shot":
      return { kind: "shot", existing: entry.item };
    case "weight":
      return { kind: "weight", existing: entry.item };
    case "effect":
      return { kind: "effect", existing: entry.item };
    case "measure":
      return { kind: "measure", existing: entry.item };
  }
}

export default function App() {
  const { data } = useStore();
  const { toast, showToast } = useToast();
  const [tab, setTab] = useState<Tab>("home");
  const [inSettings, setInSettings] = useState(false);
  const [sheet, setSheet] = useState<ActiveSheet>(null);

  if (!data.onboarded) return <OnboardingView />;

  const goTo = (nextTab: Tab) => {
    setInSettings(false);
    setTab(nextTab);
  };

  return (
    <div className="app">
      <TopBar name={data.settings.name} inSettings={inSettings} onToggleSettings={() => setInSettings((s) => !s)} />

      {inSettings ? (
        <SettingsView showToast={showToast} />
      ) : (
        <>
          {tab === "home" && (
            <HomeView
              onLogShot={() => setSheet({ kind: "shot" })}
              onSeeTrends={() => goTo("trends")}
              onSeeHistory={() => goTo("history")}
              onOpenSettings={() => setInSettings(true)}
              onEdit={(entry) => setSheet(sheetForEntry(entry))}
            />
          )}
          {tab === "trends" && <TrendsView />}
          {tab === "history" && <HistoryView onEdit={(entry) => setSheet(sheetForEntry(entry))} />}
          {tab === "help" && <HelpView />}
        </>
      )}

      <Dock tab={tab} onTab={goTo} onAdd={() => setSheet({ kind: "menu" })} />
      <SheetRouter
        sheet={sheet}
        onClose={() => setSheet(null)}
        onOpen={(kind) => setSheet({ kind })}
        onDone={showToast}
      />
      <Toast toast={toast} />
    </div>
  );
}
