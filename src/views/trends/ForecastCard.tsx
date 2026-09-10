import type { AppData } from "../../types";
import { DAY, fmtDay, fmtDayFull, fromLocalDateValue, startOfDay, toLocalDateValue } from "../../lib/dates";
import { forecast } from "../../lib/forecast";
import { fmtWeight } from "../../lib/weight";
import { useStore } from "../../store/StoreProvider";

const DEFAULT_WEEKS_AHEAD = 6;

/** "What will I weigh on …?" — the question every event on the calendar asks. */
export default function ForecastCard({ data }: { data: AppData }) {
  const { dispatch } = useStore();
  const unit = data.settings.unit;
  const goal = data.settings.goalLbs;
  const targetTs = data.settings.forecastDate ?? startOfDay(Date.now()) + DEFAULT_WEEKS_AHEAD * 7 * DAY + DAY / 2;
  const f = forecast(data, targetTs);

  const projected = (lbs: number) => (goal != null && lbs <= goal ? `${fmtWeight(goal, unit)} 🏁` : fmtWeight(lbs, unit));
  const pace = (rate: number) => `${fmtWeight(Math.abs(rate), unit)}/wk`;
  const goalLine =
    f && goal != null && f.goalAtRecentTs && f.goalAtOverallTs
      ? `${fmtWeight(goal, unit)} lands around ${fmtDay(f.goalAtRecentTs)} at your recent pace, ${fmtDay(f.goalAtOverallTs)} at your overall pace.`
      : f && goal != null && f.trendLbs <= goal
        ? "You're at your goal — the forecast is now about holding it."
        : f && goal != null
          ? "The trend isn't falling right now, so there's no goal date to name yet."
          : "";

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Forecast</h3>
          <div className="card-sub">Pick a date — straight-line math from your 7-day trend</div>
        </div>
      </div>
      <input
        type="date"
        className="input forecast-date"
        aria-label="Forecast date"
        value={toLocalDateValue(targetTs)}
        onChange={(e) => e.target.value && dispatch({ type: "updateSettings", patch: { forecastDate: fromLocalDateValue(e.target.value) } })}
      />
      {!f ? (
        <p className="field-hint">Needs a couple of weeks of weigh-ins first.</p>
      ) : f.weeks < 0.5 ? (
        <p className="field-hint">Pick a date at least a few days out.</p>
      ) : (
        <>
          <div className="forecast-when">
            By {fmtDayFull(targetTs)} · {Math.round(f.weeks)} {Math.round(f.weeks) === 1 ? "week" : "weeks"} out
          </div>
          <div className="forecast-grid">
            <div className="forecast-cell">
              <div className="forecast-value">{projected(f.atRecent)}</div>
              <div className="forecast-label">at your recent pace · {pace(f.recentRate)}</div>
            </div>
            <div className="forecast-cell">
              <div className="forecast-value">{projected(f.atOverall)}</div>
              <div className="forecast-label">at your overall pace · {pace(f.overallRate)}</div>
            </div>
          </div>
          <p className="field-hint">
            {goalLine} Real loss slows as you get lighter, so read the later dates as the optimistic end.
          </p>
        </>
      )}
    </section>
  );
}