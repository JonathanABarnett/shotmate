import { useState } from "react";
import { useStore } from "../../store/StoreProvider";
import SegmentedControl from "../../components/SegmentedControl";
import WeightPanel from "./WeightPanel";
import LevelPanel from "./LevelPanel";
import DosePanel from "./DosePanel";
import EffectsPanel from "./EffectsPanel";

type PanelKey = "weight" | "level" | "dose" | "effects";

const PANELS = [
  { key: "weight", label: "Weight" },
  { key: "level", label: "Med level" },
  { key: "dose", label: "Doses" },
  { key: "effects", label: "Feels" },
] as const;

export default function TrendsView() {
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
      {panel === "effects" && <EffectsPanel data={data} />}
    </div>
  );
}
