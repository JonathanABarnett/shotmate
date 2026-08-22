import ProfileSection from "./ProfileSection";
import MedicationSection from "./MedicationSection";
import GoalsSection from "./GoalsSection";
import AppearanceSection from "./AppearanceSection";
import ShareSection from "./ShareSection";
import SyncSection from "./SyncSection";
import DataSection from "./DataSection";
import type { SyncState } from "../../sync/useSync";

interface Props {
  showToast: (message: string) => void;
  onOpenReport: () => void;
  sync: SyncState;
}

export default function SettingsView({ showToast, onOpenReport, sync }: Props) {
  return (
    <div className="view">
      <div className="section-label">Profile</div>
      <ProfileSection />
      <div className="section-label">Medication</div>
      <MedicationSection />
      <div className="section-label">Goals &amp; units</div>
      <GoalsSection />
      <div className="section-label">Appearance</div>
      <AppearanceSection />
      <div className="section-label">Sync &amp; reminders</div>
      <SyncSection sync={sync} showToast={showToast} />
      <div className="section-label">Share &amp; remind</div>
      <ShareSection showToast={showToast} onOpenReport={onOpenReport} />
      <div className="section-label">Data</div>
      <DataSection showToast={showToast} synced={!!sync.userId} />
      <p className="tiny muted" style={{ textAlign: "center", padding: "6px 0 12px" }}>
        ShotMate v1.0 · made with 💜 · not medical advice
      </p>
    </div>
  );
}
