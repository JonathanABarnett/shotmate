import ProfileSection from "./ProfileSection";
import MedicationSection from "./MedicationSection";
import GoalsSection from "./GoalsSection";
import AppearanceSection from "./AppearanceSection";
import ShareSection from "./ShareSection";
import DataSection from "./DataSection";

interface Props {
  showToast: (message: string) => void;
  onOpenReport: () => void;
}

export default function SettingsView({ showToast, onOpenReport }: Props) {
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
      <div className="section-label">Share &amp; remind</div>
      <ShareSection showToast={showToast} onOpenReport={onOpenReport} />
      <div className="section-label">Data</div>
      <DataSection showToast={showToast} />
      <p className="tiny muted" style={{ textAlign: "center", padding: "6px 0 12px" }}>
        ShotMate v1.0 · made with 💜 · not medical advice
      </p>
    </div>
  );
}
