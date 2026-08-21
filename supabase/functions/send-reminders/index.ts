// Hourly reminder sender — invoked by pg_cron via pg_net. Uses the service role
// to read subscriptions and VAPID keys; sends "shot day tomorrow" (evening
// before) and "it's shot day" (morning of) once per due date per device.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const DAY_MS = 86_400_000;
const EVE_HOURS = { from: 17, to: 21 };
const DAY_HOURS = { from: 7, to: 12 };

interface Row {
  id: string;
  subscription: webpush.PushSubscription;
  tz_offset_min: number | null;
  next_due: string | null;
  dose_mg: number | null;
  med_name: string | null;
  notified_eve_due: string | null;
  notified_day_due: string | null;
}

/** Local wall-clock hour and day index for a device, from its UTC offset in minutes. */
function localClock(utcMs: number, tzOffsetMin: number) {
  const shifted = utcMs - tzOffsetMin * 60_000;
  return { hour: new Date(shifted).getUTCHours(), dayIndex: Math.floor(shifted / DAY_MS) };
}

function pickReminder(row: Row, nowMs: number): "eve" | "day" | null {
  if (!row.next_due) return null;
  const tz = row.tz_offset_min ?? 0;
  const now = localClock(nowMs, tz);
  const due = localClock(new Date(row.next_due).getTime(), tz);
  const daysUntil = due.dayIndex - now.dayIndex;
  const inWindow = (w: { from: number; to: number }) => now.hour >= w.from && now.hour <= w.to;
  if (daysUntil === 1 && inWindow(EVE_HOURS) && row.notified_eve_due !== row.next_due) return "eve";
  if (daysUntil <= 0 && inWindow(DAY_HOURS) && row.notified_day_due !== row.next_due) return "day";
  return null;
}

function payloadFor(kind: "eve" | "day", row: Row) {
  const med = row.med_name ?? "your medication";
  const what = row.dose_mg != null ? `${row.dose_mg} mg of ${med}` : med;
  return kind === "eve"
    ? { title: "Shot day tomorrow 💉", body: `${what} — a good night to set everything out.`, url: "/?action=shot", tag: "shot-eve" }
    : { title: "It's shot day 💉", body: `${what} today — log it in ShotMate when you're done.`, url: "/?action=shot", tag: "shot-day" };
}

Deno.serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cfgRows, error: cfgErr } = await supabase.from("app_config").select("key, value");
  if (cfgErr) return Response.json({ error: cfgErr.message }, { status: 500 });
  const cfg = Object.fromEntries((cfgRows ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  if (!cfg.vapid_public || !cfg.vapid_private) return Response.json({ error: "VAPID keys not configured" }, { status: 500 });
  webpush.setVapidDetails(cfg.vapid_subject ?? "https://github.com/JonathanABarnett/shotmate", cfg.vapid_public, cfg.vapid_private);

  const { data: rows, error } = await supabase.from("push_subscriptions").select("*").not("next_due", "is", null);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const now = Date.now();
  let sent = 0;
  let removed = 0;
  for (const row of (rows ?? []) as Row[]) {
    const kind = pickReminder(row, now);
    if (!kind) continue;
    try {
      await webpush.sendNotification(row.subscription, JSON.stringify(payloadFor(kind, row)));
      const mark = kind === "eve" ? { notified_eve_due: row.next_due } : { notified_day_due: row.next_due };
      await supabase.from("push_subscriptions").update(mark).eq("id", row.id);
      sent++;
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", row.id);
        removed++;
      }
    }
  }
  return Response.json({ checked: rows?.length ?? 0, sent, removed });
});
