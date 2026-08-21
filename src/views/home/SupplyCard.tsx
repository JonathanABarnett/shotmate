import { FlaskConical } from "lucide-react";
import type { AppData } from "../../types";
import { fmtDayFull } from "../../lib/dates";
import { supplyStatus } from "../../lib/supply";

/** Vial inventory forecast — only shows once a supply is recorded in Settings. */
export default function SupplyCard({ data }: { data: AppData }) {
  const status = supplyStatus(data);
  if (!status) return null;

  const { remainingMg, shotsLeft, runOutTs, low } = status;
  const dose = data.settings.plannedDoseMg;

  return (
    <section className="card supply-card">
      <div className="row-between">
        <div className="supply-main">
          <span className={`entry-ico ${low ? "coral" : "teal"}`}>
            <FlaskConical size={19} />
          </span>
          <span>
            <div className="entry-title">≈ {remainingMg} mg in your vials</div>
            <div className="entry-sub">
              {shotsLeft > 0
                ? `About ${shotsLeft} more ${shotsLeft === 1 ? "shot" : "shots"} at ${dose} mg${runOutTs ? ` · runs out ~${fmtDayFull(runOutTs)}` : ""}`
                : "Not enough for your next dose"}
            </div>
          </span>
        </div>
        {low && <span className="pill-note coral">Reorder soon 📦</span>}
      </div>
    </section>
  );
}
