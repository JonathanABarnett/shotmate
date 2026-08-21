import { useEffect, useState } from "react";
import type { Entry } from "./types";
import { useStore } from "./store/StoreProvider";
import { Toast, useToast } from "./hooks/useToast";
import { useTheme } from "./hooks/useTheme";
import { useLaunchAction } from "./hooks/useLaunchAction";
import { useAchievementToasts } from "./hooks/useAchievementToasts";
import { deleteOrphanPhotoBlobs } from "./store/photoStore";
import { isDemoRequest } from "./store/persistence";
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
import ReportView from "./views/report/ReportView";

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
    case "photo":
      return { kind: "photo", existing: entry.item };
    case "win":
      return { kind: "win", existing: entry.item };
    case "activity":
      return { kind: "activity", existing: entry.item };
    case "vitals":
      return { kind: "vitals", existing: entry.item };
  }
}

export default function App() {
  const { data, dispatch } = useStore();
  const { toast, showToast, dismissToast } = useToast();
  const [tab, setTab] = useState<Tab>("home");
  const [inSettings, setInSettings] = useState(false);
  const [inReport, setInReport] = useState(false);
  const [sheet, setSheet] = useState<ActiveSheet>(null);
  useTheme(data.settings.theme ?? "auto");
  useAchievementToasts(data, showToast, dispatch);

  // Home-screen shortcuts / notification taps: open straight into the right sheet.
  useLaunchAction((action) => {
    if (action === "checkin") {
      setTab("home");
      setTimeout(() => document.querySelector(".checkin-card")?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    } else {
      setSheet({ kind: action });
    }
  });

  // Photos deleted (and not undone) leave their pixels behind until the next launch.
  useEffect(() => {
    if (!isDemoRequest()) void deleteOrphanPhotoBlobs(data.photos.map((p) => p.id));
    // once per launch — deliberately not reacting to later photo changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data.onboarded) return <OnboardingView />;
  if (inReport) return <ReportView onBack={() => setInReport(false)} />;

  const goTo = (nextTab: Tab) => {
    setInSettings(false);
    setTab(nextTab);
  };

  return (
    <div className="app">
      <TopBar name={data.settings.name} inSettings={inSettings} onToggleSettings={() => setInSettings((s) => !s)} />

      {inSettings ? (
        <SettingsView showToast={showToast} onOpenReport={() => setInReport(true)} />
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
          {tab === "trends" && <TrendsView onAddPhoto={() => setSheet({ kind: "photo" })} showToast={showToast} />}
          {tab === "history" && <HistoryView onEdit={(entry) => setSheet(sheetForEntry(entry))} />}
          {tab === "help" && <HelpView />}
        </>
      )}

      <Dock tab={tab} onTab={goTo} onAdd={() => setSheet({ kind: "menu" })} />
      <SheetRouter
        sheet={sheet}
        onClose={() => setSheet(null)}
        onOpen={(kind) => setSheet({ kind })}
        onDone={(message, undo) => showToast(message, undo ? { label: "Undo", onClick: undo } : undefined)}
      />
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
