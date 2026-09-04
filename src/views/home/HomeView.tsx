import type { Entry } from "../../types";
import type { InstallPrompt } from "../../hooks/useInstallPrompt";
import type { SyncState } from "../../sync/useSync";
import InstallBanner from "../../components/InstallBanner";
import { useStore } from "../../store/StoreProvider";
import HeroCard from "./HeroCard";
import StatTilesRow from "./StatTilesRow";
import HomeSpotlight from "./HomeSpotlight";
import CheckinCard from "./CheckinCard";
import CycleReviewCard from "./CycleReviewCard";
import SupplyCard from "./SupplyCard";
import IntakeCard from "./IntakeCard";
import WeightTrendCard from "./WeightTrendCard";
import GoalCard from "./GoalCard";
import RecentActivity from "./RecentActivity";
import PhotosCard from "../trends/PhotosCard";

interface Props {
  installPrompt: InstallPrompt;
  sync: SyncState;
  showToast: (message: string) => void;
  onLogShot: () => void;
  onLogMeasure: () => void;
  onLogCalories: () => void;
  onAddPhoto: () => void;
  onSeeTrends: () => void;
  onSeeHistory: () => void;
  onOpenSettings: () => void;
  onEdit: (entry: Entry) => void;
}

export default function HomeView({ installPrompt, sync, showToast, onLogShot, onLogMeasure, onLogCalories, onAddPhoto, onSeeTrends, onSeeHistory, onOpenSettings, onEdit }: Props) {
  const { data } = useStore();
  const hidden = new Set(data.settings.hiddenHomeCards ?? []);
  return (
    <div className="view">
      {data.sample && (
        <p className="callout note">
          👀 You're browsing <strong>sample data</strong> — clear it anytime in Settings → Data.
        </p>
      )}
      <InstallBanner prompt={installPrompt} />
      <HeroCard data={data} onLogShot={onLogShot} />
      <StatTilesRow data={data} />
      <HomeSpotlight data={data} sync={sync} showToast={showToast} onOpenSettings={onOpenSettings} onLogMeasure={onLogMeasure} onLogPhoto={onAddPhoto} />
      {!hidden.has("checkin") && <CheckinCard data={data} />}
      {!hidden.has("cycle") && <CycleReviewCard data={data} />}
      <SupplyCard data={data} />
      {!hidden.has("intake") && <IntakeCard data={data} onLogCalories={onLogCalories} />}
      {!hidden.has("photos") && <PhotosCard data={data} onAddPhoto={onAddPhoto} onEditPhoto={(p) => onEdit({ kind: "photo", item: p })} />}
      <WeightTrendCard data={data} onSeeTrends={onSeeTrends} />
      {!hidden.has("goal") && <GoalCard data={data} onOpenSettings={onOpenSettings} />}
      <RecentActivity data={data} onEdit={onEdit} onSeeAll={onSeeHistory} />
    </div>
  );
}
