import { useState } from "react";
import type { PhotoEntry } from "../../types";
import { useStore } from "../../store/StoreProvider";
import SegmentedControl from "../../components/SegmentedControl";
import WeightPanel from "./WeightPanel";
import InsightsPanel from "./InsightsPanel";
import LevelPanel from "./LevelPanel";
import DosePanel from "./DosePanel";
import BodyPanel from "./BodyPanel";
import BodySnapshot from "./BodySnapshot";
import VitalsPanel from "./VitalsPanel";
import PhotosCard from "./PhotosCard";
import ActivityPanel from "./ActivityPanel";
import EffectsPanel from "./EffectsPanel";

type PanelKey = "weight" | "insights" | "level" | "body" | "vitals" | "activity" | "effects";

const PANELS = [
  { key: "weight", label: "Weight" },
  { key: "insights", label: "Insights" },
  { key: "level", label: "Medication" },
  { key: "body", label: "Body" },
  { key: "vitals", label: "Vitals" },
  { key: "activity", label: "Moves" },
  { key: "effects", label: "Feels" },
] as const;

interface Props {
  onAddPhoto: () => void;
  onEditPhoto: (photo: PhotoEntry) => void;
  showToast: (message: string) => void;
}

export default function TrendsView({ onAddPhoto, onEditPhoto, showToast }: Props) {
  const { data } = useStore();
  const [panel, setPanel] = useState<PanelKey>("weight");

  // The Vitals tab earns its spot with the first labs entry — logging it stays in the + menu.
  const panels = PANELS.filter((p) => p.key !== "vitals" || data.vitals.length > 0);
  const active: PanelKey = panels.some((p) => p.key === panel) ? panel : "weight";

  return (
    <div className="view">
      <SegmentedControl
        ariaLabel="Trend charts"
        options={panels.map((p) => ({ key: p.key as PanelKey, label: p.label }))}
        value={active}
        onChange={setPanel}
      />
      {active === "weight" && <WeightPanel data={data} />}
      {active === "insights" && <InsightsPanel data={data} />}
      {active === "level" && (
        <>
          <LevelPanel data={data} />
          <DosePanel data={data} />
        </>
      )}
      {active === "body" && (
        <>
          <BodySnapshot data={data} />
          <BodyPanel data={data} />
          <PhotosCard data={data} onAddPhoto={onAddPhoto} onEditPhoto={onEditPhoto} />
        </>
      )}
      {active === "vitals" && <VitalsPanel data={data} />}
      {active === "activity" && <ActivityPanel data={data} showToast={showToast} />}
      {active === "effects" && <EffectsPanel data={data} />}
    </div>
  );
}
