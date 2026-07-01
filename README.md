# Preventative Health Dashboard

A private, browser-based preventative health dashboard focused on long-term trend analysis. Lab tracking remains blood and urine only; STI and immunoserology tests are intentionally excluded.

## Open it

Open `index.html` in a browser.

## Cloud Setup

The app can run locally without Supabase. Cloud login and sync activate after `supabase-config.js` is filled with the Supabase project URL and public anon key, and after the SQL in `supabase/health_dashboard_data.sql` has been run in Supabase.

## What it does

- Saves results locally in the browser
- Supports two people: Ben and Angelika
- Stores stable profile context separately: name, date of birth, and height
- Shows saved people as clickable profile cards, with an Edit button for corrections
- Tracks result date and sample/measurement date separately
- Tracks baseline demographics, vitals, fitness, annual blood/urine tests, cardiovascular markers, and clinically indicated hormone markers
- Does not track BMI
- Uses built-in suggested testing intervals, from twice-monthly body metrics through multi-year investigations
- Remembers reference lower and upper limits per person and metric after first entry
- Locks saved reference ranges unless edited deliberately
- Flags values as in range, near a range limit, or outside range
- Shows due soon and overdue checks with amber/red visual cues
- Shows a trends section with latest value, previous change, highest, lowest, recent history, and a chart
- Stores status versus range, previous result, absolute change, percentage change, and trend direction
- Uses Improved / Stable / Worse trend labels where a metric has a clear preferred direction
- Handles qualitative urine values such as `Negative` or `Rare` as changed/unchanged
- Shows latest values by metric
- Exports results as CSV
- Exports a ChatGPT-friendly Markdown summary with purpose, profiles, warnings, due items, latest values, and full measurement history
- Imports ChatGPT-generated JSON measurement files
- Reviews ChatGPT imports before saving them
- Shows a lightweight line chart for numeric metric trends
- Exports a focused review pack for warnings, due items, and material changes
- Shows a low-distraction footer with local status, manual refresh, version, and future sign-out placement
- Includes PWA-ready manifest, PNG/SVG app icons, and hosted service-worker shell caching
- Includes Supabase Auth/cloud-sync scaffolding that activates once `supabase-config.js` is configured

This is a personal record-keeping tool, not medical advice.

## Future Hosting

See `SUPABASE_PLAN.md` for the GitHub/Supabase architecture, per-user privacy, import workflow, and backup requirements. The cloud version uses Supabase Auth plus one private JSONB dashboard row per user, with manual refresh, conflict protection, offline read-only viewing, visible versioning, and a bottom sync footer.
