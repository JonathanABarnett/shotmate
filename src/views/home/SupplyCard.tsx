import { FlaskConical } from "lucide-react";
import type { AppData } from "../../types";
import { fmtDayFull } from "../../lib/dates";
import { BUD_WARN_DAYS, fmtUsd, supplyStatus } from "../../lib/supply";

/** Vial inventory forecast — only shows once a supply is recorded in Settings. */
export default function SupplyCard({ data }: { data: AppData }) {
  const status = supplyStatus(data);
  if (!status) return null;

  const { remainingMg, shotsLeft, runOutTs, orderByTs, low, costPerWeek, budTs, budDaysLeft, budBeforeRunOut } = status;
  const dose = data.settings.plannedDoseMg;
  const orderSoon = orderByTs != null && orderByTs <= Date.now();
  const budSoon = budDaysLeft != null && budDaysLeft <= BUD_WARN_DAYS;
  const budLine =
    budDaysLeft == null
      ? undefined
      : budDaysLeft <= 0
        ? "Past its beyond-use date — time for a fresh vial 🧪"
        : budSoon
          ? `Beyond-use date in ${budDaysLeft} ${budDaysLeft === 1 ? "day" : "days"} 🧪`
          : budBeforeRunOut
            ? "Its beyond-use date comes before you'd finish it — plan the next vial by then"
            : undefined;
  const details = [
    shotsLeft > 0 ? `About ${shotsLeft} more ${shotsLeft === 1 ? "shot" : "shots"} at ${dose} mg` : "Not enough for your next dose",
    ...(runOutTs ? [`runs out ~${fmtDayFull(runOutTs)}`] : []),
    ...(budTs != null && !budSoon ? [`good until ${fmtDayFull(budTs)}`] : []),
    ...(costPerWeek != null ? [`≈ ${fmtUsd(costPerWeek)}/week`] : []),
  ];

  return (
    <section className="card supply-card">
      <div className="row-between">
        <div className="supply-main">
          <span className={`entry-ico ${low || orderSoon || budSoon ? "coral" : "teal"}`}>
            <FlaskConical size={19} />
          </span>
          <span>
            <div className="entry-title">≈ {remainingMg} mg in your vials</div>
            <div className="entry-sub">{details.join(" · ")}</div>
            {orderByTs != null && !low && (
              <div className="entry-sub">{orderSoon ? "Time to reorder 📦" : `Order by ~${fmtDayFull(orderByTs)} to avoid a gap`}</div>
            )}
            {budLine && <div className="entry-sub">{budLine}</div>}
          </span>
        </div>
        {budSoon ? (
          <span className="pill-note coral">{budDaysLeft! <= 0 ? "Past BUD 🧪" : "BUD soon 🧪"}</span>
        ) : (
          (low || orderSoon) && <span className="pill-note coral">Reorder soon 📦</span>
        )}
      </div>
    </section>
  );
}
