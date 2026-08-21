import { useState } from "react";
import { useStore } from "../../store/StoreProvider";
import SegmentedControl from "../../components/SegmentedControl";
import WeightPanel from "./WeightPanel";
import InsightsPanel from "./InsightsPanel";
import LevelPanel from "./LevelPanel";
import DosePanel from "./DosePanel";
import BodyPanel from "./BodyPanel";
import PhotosCard from "./PhotosCard";
import ActivityPanel from "./ActivityPanel";
import EffectsPanel from "./EffectsPanel";

type PanelKey = "weight" | "insights" | "level" | "dose" | "body" | "activity" | "effects";

const PANELS = [
  { key: "weight", label: "Weight" },
  { key: "insights", label: "Insights" },
  { key: "level", label: "Med level" },
  { key: "dose", label: "Doses" },
  { key: "body", label: "Body" },
  { key: "activity", label: "Moves" },
  { key: "effects", label: "Feels" },
] as const;

interface Props {
  onAddPhoto: () => void;
  showToast: (message: string) => void;
}

export default function TrendsView({ onAddPhoto, showToast }: Props) {
  const { data } = useStore();
  const [panel, setPanel] = useState<PanelKey>("weight");

  return (
    <div className="view">
      <SegmentedControl
        ariaLabel="Trend charts"
        options={PANELS.map((p) => ({ key: p.key as PanelKey, label: p.label }))}
        value={panel}
        onChange={setPanel}
      />
      {panel === "weight" && <WeightPanel data={data} />}
      {panel === "insights" && <InsightsPanel data={data} />}
      {panel === "level" && <LevelPanel data={data} />}
      {panel === "dose" && <DosePanel data={data} />}
      {panel === "body" && (
        <>
          <BodyPanel data={data} />
          <PhotosCard data={data} onAddPhoto={onAddPhoto} />
        </>
      )}
      {panel === "activity" && <ActivityPanel data={data} showToast={showToast} />}
      {panel === "effects" && <EffectsPanel data={data} />}
    </div>
  );
}
