import { useState } from "react";
import { useStore } from "../../store/StoreProvider";
import SegmentedControl from "../../components/SegmentedControl";
import WeightPanel from "./WeightPanel";
import LevelPanel from "./LevelPanel";
import DosePanel from "./DosePanel";
import BodyPanel from "./BodyPanel";
import PhotosCard from "./PhotosCard";
import EffectsPanel from "./EffectsPanel";

type PanelKey = "weight" | "level" | "dose" | "body" | "effects";

const PANELS = [
  { key: "weight", label: "Weight" },
  { key: "level", label: "Med level" },
  { key: "dose", label: "Doses" },
  { key: "body", label: "Body" },
  { key: "effects", label: "Feels" },
] as const;

interface Props {
  onAddPhoto: () => void;
}

export default function TrendsView({ onAddPhoto }: Props) {
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
      {panel === "level" && <LevelPanel data={data} />}
      {panel === "dose" && <DosePanel data={data} />}
      {panel === "body" && (
        <>
          <BodyPanel data={data} />
          <PhotosCard data={data} onAddPhoto={onAddPhoto} />
        </>
      )}
      {panel === "effects" && <EffectsPanel data={data} />}
    </div>
  );
}
