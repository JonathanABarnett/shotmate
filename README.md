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
