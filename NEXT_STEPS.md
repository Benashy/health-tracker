# Next Steps

## GitHub And Supabase

Next time, move this app from a local-only browser tracker to a proper hosted app:

- Add the project to GitHub.
- Add Supabase as the live database.
- Use `SUPABASE_PLAN.md` as the deployment guide.
- Replace browser-only local storage with one private Supabase JSONB data row per user.
- Keep structured Supabase tables as a later upgrade path only if reporting or audit needs justify them.
- Create login using Supabase email/password first, with magic links as an optional secondary method.
- Fill `supabase-config.js` with the Supabase project URL and public anon key once the project exists.
- Use controlled account creation rather than a public sign-up flow.
- Restrict access to Ben and Angelika only.
- Start with fresh cloud accounts and do not migrate any existing local browser data.
- Keep account, sync, refresh, version, and sign-out controls in the bottom footer.
- Add manual cloud refresh and clear `Updated just now / Updated X min ago` status.
- Add stale-write protection before saving so one device cannot overwrite newer cloud data from another device.
- Use the Supabase `updated_at` value as the save conflict token.
- Support offline viewing as read-only unless robust conflict handling is added.
- Keep the PWA install support, manifest, app icon, and service worker cache aligned with each release.
- Use visible versioning and cache-busting query strings on every release.
- Use separate Ben and Angelika logins rather than a shared account.
- Add Supabase row-level security so each person sees only their own measurements by default.
- Treat this as a preventative health dashboard, not only a blood results tracker.
- Store profile details inside each user's private dashboard JSON: name, date of birth, and height.
- Keep profiles clickable as dashboard filters, with edit controls for correcting stable profile details.
- Include vitals, fitness metrics, cardiovascular markers, hormone panel markers, and one-off/infrequent investigations in the cloud data.
- Do not add BMI.
- Preserve per-metric schedule intervals and due/overdue states.
- Preserve CSV export and ChatGPT-friendly Markdown export.
- Preserve ChatGPT JSON import.
- Preserve import review before saving ChatGPT-extracted data.
- Preserve review pack export focused on abnormal, near-limit, overdue, or materially changed results.
- Preserve stored per-person, per-metric reference ranges with explicit edit flow.
- Preserve trend summaries: latest, change, highest, lowest, history, and chart.
- Keep tracking blood and urine results only.
- Continue excluding STI and immunoserology tests.

## Backup Process

The app's live data will be stored in Supabase, not in the GitHub website files. GitHub backs up the app code, but the actual user data needs a separate backup.

Use `BACKUP_PLAN.md` as the detailed backup implementation guide.

The backup system should use a local Python script on the Mac which:

- Connects to Supabase using a private service-role key.
- Downloads `health_dashboard_data`.
- Saves one full JSON backup file named `health-dashboard-backup.json`.
- Saves optional CSV review files for tabular measurement data.
- Saves a plain-English summary text file.

Store the backup in Dropbox under:

```text
Dropbox/Health Dashboard Backups/
```

Backups should be stored in dated folders, and those dated folders are the source of truth:

```text
Health Dashboard Backups/daily/2026-06-29-1800
```

There can also be a `latest-scheduled` folder, but it is best effort only. Dropbox may block or delay automatic overwrites, so the dated folders remain the reliable backup record.

## Automatic Schedule

A macOS LaunchAgent should run the backup automatically.

It should be configured to try:

- When the Mac loads the schedule
- Every hour
- 07:00
- 12:00
- 18:00
- 00:00

The repeated attempts are deliberate because the Mac may be off, asleep, offline, or unable to reach Dropbox/Supabase at any single scheduled time.

The script should keep a local success marker on the Mac. Once a successful backup has been created for that day, later scheduled runs should skip.

## Why Dropbox

Dropbox provides an independent recovery copy outside Supabase and GitHub. If the website or Supabase data broke, the backup files could be used to inspect or rebuild the data.

The most important recovery file is `health-dashboard-backup.json`. CSV files are secondary review aids because they can be opened directly in Excel.

## What Needs Protecting

The private file containing the Supabase service-role key must not be uploaded to GitHub. It stays only on the Mac in the backup tool folder.
