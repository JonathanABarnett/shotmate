import type { Entry } from "../../types";
import { useStore } from "../../store/StoreProvider";
import HeroCard from "./HeroCard";
import StatTilesRow from "./StatTilesRow";
import WeightTrendCard from "./WeightTrendCard";
import GoalCard from "./GoalCard";
import RecentActivity from "./RecentActivity";

interface Props {
  onLogShot: () => void;
  onSeeTrends: () => void;
  onSeeHistory: () => void;
  onOpenSettings: () => void;
  onEdit: (entry: Entry) => void;
}

export default function HomeView({ onLogShot, onSeeTrends, onSeeHistory, onOpenSettings, onEdit }: Props) {
  const { data } = useStore();
  return (
    <div className="view">
      {data.sample && (
        <p className="callout note">
          👀 You're browsing <strong>sample data</strong> — clear it anytime in Settings → Data.
        </p>
      )}
      <HeroCard data={data} onLogShot={onLogShot} />
      <StatTilesRow data={data} />
      <WeightTrendCard data={data} onSeeTrends={onSeeTrends} />
      <GoalCard data={data} onOpenSettings={onOpenSettings} />
      <RecentActivity data={data} onEdit={onEdit} onSeeAll={onSeeHistory} />
    </div>
  );
}
