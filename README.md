# ShotMate 💜

Your own GLP-1 companion — shots, weight, and how you feel, tracked in one friendly place.
No subscription, no account, no cloud: **everything stays in your browser's local storage.**

![ShotMate](public/icon.svg)

## Features

- **Shot logging** — dose ladder per medication, date/time, notes, and a tappable **body map**
  that suggests your least-recently-used injection site (`✦ next up`).
- **Next-shot countdown** — gradient hero card with a progress ring, due dates, and overdue states.
- **Weight tracking** — big friendly entry, chart with 7-day trend line, goal reference line,
  weekly pace, BMI, and range filters (1M / 3M / 6M / All).
- **Medication-level estimate** — a simple absorption + half-life model of how much medication
  is in your system, with a dashed projection to your next shot. An estimate for curiosity,
  not medical guidance.
- **Dose history** — your titration journey as a bar chart.
- **Body measurements** — chest, waist, hips, arm, and thigh check-ins with per-measure
  trend lines and change-since-start (tape numbers often move before the scale does), plus a
  **body snapshot** figure with your weight and each measurement drawn on the body it belongs to.
- **Progress photos** — private on-device photos (IndexedDB) with a before/after compare
  view; included in JSON backups.
- **Provider report** — a one-tap printable summary (weight chart, injections, side
  effects, measurements) for appointments.
- **Shot-day calendar** — download a repeating calendar event with a reminder (.ics).
- **Daily check-in** — two taps (hunger, energy) on Home; feeds the cycle-pattern insight.
- **Insights** — a dedicated Trends tab of cross-referenced patterns, each unlocking only once
  there's enough data to be honest: milestones & goal ETA, pace/plateau detection, hunger &
  energy across the shot cycle, tape vs. scale, shot-day water weight, side effects after dose
  step-ups, active weeks vs. pace, injection-site rotation health, and schedule consistency —
  plus side-effect timing and pace-at-each-dose on their own panels, and a per-cycle digest on Home.
- **Activity** — quick-log walks/runs/rides/workouts or import a MapMyRun CSV export
  (deduplicated), with weekly active-minutes charting.
- **Labs & vitals** — blood pressure, resting heart rate, A1c, glucose, and lipids with
  per-metric trend lines; included in the provider report.
- **Achievements** — badges for consistency, milestones, and habits, with unlock toasts and
  a "next up" progress list.
- **Photo share card** — a before/after (or single) photo stamped with date, weight, and waist,
  shared via the native share sheet or saved as a PNG.
- **Cost tracking** — record what a supply cost to see per-shot / per-week figures and an
  "order by" date based on your reorder lead time.
- **Quality of life** — undo after deleting anything, history search, home-screen app
  shortcuts (log shot / log weight / check-in), and a tab row that scrolls with the mouse wheel.
- **Protein & water quick-log** — daily meters with tap-to-add on the home screen.
- **Wins journal** — non-scale victories, celebrated properly.
- **Dark mode** — auto/light/dark, charts included.
- **Side-effect journal** — quick symptom chips, severity, and frequency summaries.
- **History timeline** — every entry, grouped by day, tap to edit or delete.
- **Help** — friendly guidance on injections, site rotation, side effects, storage, and red flags.
- **Data ownership** — JSON export/import backups, sample-data mode, full wipe.
- **PWA** — installable with offline support via a service worker.

Supported out of the box: Wegovy, Ozempic, Zepbound, Mounjaro, Saxenda, Trulicity, or a custom
medication with your own name and half-life.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173. Add `?demo` to the URL to browse with sample data without touching
your real data (demo mode never saves).

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run icons` | Regenerate PNG icons from `public/icon.svg` |
| `node scripts/screenshots.mjs` | Capture app screenshots (dev server must be running) |

## Sync & reminders (optional)

Sign in once per device (Settings → Sync & reminders, magic link by email) to keep phone and laptop
on the same history and to get **shot-day push notifications** (the evening before and the morning
of). Backend is a free-tier Supabase project; sources live in `supabase/`:

- `migrations/0001_sync_and_reminders.sql` — one `snapshots` row per user (last-write-wins),
  `push_subscriptions`, and a service-role-only `app_config` (VAPID keys). Row-level security
  on everything.
- `functions/send-reminders/` — edge function run hourly by `pg_cron` → `pg_net`; sends Web Push
  once per due date per device and prunes dead subscriptions.

The first time a device joins an account it merges (union of entries, account settings win) so
neither side loses data; after that, newest snapshot wins. Photos never sync (their pixels stay in
each device's IndexedDB). Without sign-in the app stays fully local. Supabase project settings needed once: Authentication → URL configuration → set the
Site URL to your deployed app and add `http://localhost:5173/**` to redirect URLs.

## Using it on your phone

Data lives per-device in local storage, so pick one:

- **Same Wi-Fi, quick look:** `npm run dev -- --host`, then open `http://<your-pc-ip>:5173`
  on your phone.
- **For real daily use (recommended):** deploy `dist/` anywhere static — Vercel, Netlify, or
  GitHub Pages are all free (`npm run build`, upload `dist/`). Then on your phone open the URL
  and use **Add to Home Screen** — it installs like an app, works offline, and your data stays
  on the phone.
- Moving devices? **Settings → Data → Export backup**, then import on the new device.

## Project layout

```
src/
  lib/         domain logic — meds, pharmacokinetics, weights, shots, sites, dates
  store/       reducer, persistence, backup I/O, React provider
  components/  reusable UI — charts, form atoms, sheets, body map, dock
  views/       screens — home, trends, history, help, settings, onboarding
  styles/      design tokens + stylesheets, split by concern
```

## A note on the numbers

ShotMate is a personal tracking tool, not a medical device. The medication-level chart uses a
simple one-compartment model (24 h absorption ramp × published elimination half-life) and is a
relative estimate for spotting patterns — never a basis for dosing decisions. For anything
medical, talk to your care team.
