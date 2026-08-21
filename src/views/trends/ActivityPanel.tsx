import { useRef } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Upload } from "lucide-react";
import type { AppData } from "../../types";
import { activityDedupeKey, weeklyActivity } from "../../lib/activity";
import { fmtDay } from "../../lib/dates";
import { parseMmrCsv } from "../../lib/mmrImport";
import { useStore } from "../../store/StoreProvider";
import { CHART, ChartTip, gridProps, niceTicks, valueAxisProps } from "../../components/charts/chrome";
import EmptyState from "../../components/EmptyState";
import ChartStats from "./ChartStats";

const ACTIVITY_C = "var(--chart-activity)";

function WeeklyChart({ data }: { data: AppData }) {
  const buckets = weeklyActivity(data.activities).map((b) => ({ ts: b.ts, value: b.minutes, sessions: b.sessions }));
  const hi = Math.max(60, Math.ceil((Math.max(...buckets.map((b) => b.value)) * 1.2) / 30) * 30);

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={buckets} margin={{ top: 10, right: 10, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid {...gridProps} />
          <XAxis
            dataKey="ts"
            tickFormatter={(t: number) => fmtDay(t)}
            tick={{ fontSize: 11, fontWeight: 600, fill: CHART.axis, fontFamily: "inherit" }}
            axisLine={false}
            tickLine={false}
            minTickGap={18}
          />
          <YAxis {...valueAxisProps(36)} domain={[0, hi]} ticks={niceTicks(0, hi)} />
          <Tooltip
            content={
              <ChartTip
                color={ACTIVITY_C}
                unitLabel="min"
                digits={0}
                dateOnly
                sub={(p) => `${p.sessions} ${p.sessions === 1 ? "session" : "sessions"} that week`}
              />
            }
            cursor={{ fill: CHART.barHover }}
            isAnimationActive={false}
          />
          <Bar dataKey="value" fill={ACTIVITY_C} radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ImportButton({ data, showToast }: { data: AppData; showToast: (m: string) => void }) {
  const { dispatch } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const parsed = parseMmrCsv(await file.text());
    if (!parsed) {
      showToast("That doesn't look like a MapMyRun export");
      return;
    }
    const known = new Set(data.activities.map(activityDedupeKey));
    const fresh = parsed.entries.filter((e) => !known.has(activityDedupeKey(e)));
    if (fresh.length > 0) dispatch({ type: "addActivities", items: fresh });
    const dupes = parsed.entries.length - fresh.length;
    showToast(
      fresh.length > 0
        ? `Imported ${fresh.length} workout${fresh.length === 1 ? "" : "s"}${dupes > 0 ? ` (${dupes} already here)` : ""} 🏃`
        : "Nothing new — those workouts are already logged"
    );
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <button className="btn btn-subtle btn-block btn-sm" onClick={() => fileRef.current?.click()}>
        <Upload size={16} /> Import MapMyRun CSV
      </button>
      <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
      <p className="field-hint">
        On mapmyrun.com: Profile → Workouts → export workout history. Re-import anytime — duplicates are skipped
        automatically.
      </p>
    </>
  );
}

interface Props {
  data: AppData;
  showToast: (message: string) => void;
}

export default function ActivityPanel({ data, showToast }: Props) {
  const thisWeek = weeklyActivity(data.activities).at(-1)!;

  return (
    <section className="card">
      <div className="card-title-row">
        <div>
          <h3 className="card-title">Moving your body</h3>
          <div className="card-sub">Active minutes per week</div>
        </div>
      </div>
      {data.activities.length > 0 ? (
        <>
          <WeeklyChart data={data} />
          <ChartStats
            stats={[
              { value: `${thisWeek.minutes} min`, label: "this week" },
              { value: `${thisWeek.sessions}`, label: "sessions this week" },
              { value: `${data.activities.length}`, label: "all-time sessions" },
            ]}
          />
          <div className="spacer-16" />
        </>
      ) : (
        <EmptyState
          emoji="👟"
          title="Every walk counts"
          sub="Log activities from the + button, or pull your workouts straight from MapMyRun below."
        />
      )}
      <ImportButton data={data} showToast={showToast} />
    </section>
  );
}
