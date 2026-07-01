# Supabase And GitHub Plan

## Target Shape

- GitHub stores the app code.
- Supabase stores live user data.
- Supabase Auth gives Ben and Angelika separate private logins.
- Each signed-in user sees only their own dashboard data.
- The first hosted version should use one private JSONB data row per user.
- Reference ranges remain unique per user and metric inside that user's data blob.
- Data saves online after changes, with manual refresh available.
- Sync/account controls live in the calm footer, not in the main workflow.
- The footer shows sync status, refresh, app version, and sign out.
- Offline mode is view-only unless a proper merge system is added.
- Backups are essential and separate from GitHub.

## Recommended First Supabase Model

Use the same pattern as Ben's OpsDeck: Supabase Auth plus one private JSON blob row per user.

This is the best first step because the app is personal-use, still evolving, and stores a dashboard-shaped state rather than large reporting datasets. It keeps the cloud layer simple while still giving us private accounts, row-level security, manual refresh, conflict protection, and full JSON backup/restore.

Create one row per signed-in user:

```sql
create table public.health_dashboard_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
```

The `data` JSON should contain the whole dashboard state:

- profile details for the signed-in person
- measurements
- saved per-metric reference ranges
- import history or recent import metadata
- app data version
- local dashboard preferences where useful

The current local app state should map into this blob cleanly:

```json
{
  "profiles": [],
  "measurements": [],
  "reference_ranges": {},
  "imports": [],
  "settings": {},
  "data_version": 1
}
```

## Later Structured Table Option

Move to separate tables only if the app outgrows the JSONB model. Good reasons would include:

- heavy filtering or reporting inside Supabase
- audit trails for every changed result
- sharing selected records with a clinician
- large multi-user collaboration
- server-side dashboards or analytics

If needed later, these tables are the likely upgrade path:

- `profiles`
- `measurements`
- `reference_ranges`
- `import_batches`
- `sync_state`

Do not start here unless there is a clear reason. The JSONB-first route is simpler, safer, and faster for this personal dashboard.

## Row-Level Security

Enable RLS so each user can only read and write their own single data row.

```sql
alter table public.health_dashboard_data enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update on public.health_dashboard_data to authenticated;

create policy "Users can read their own health dashboard data"
on public.health_dashboard_data
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own health dashboard data"
on public.health_dashboard_data
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own health dashboard data"
on public.health_dashboard_data
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
```

The deployable SQL lives in `supabase/health_dashboard_data.sql`.

## Sync And Conflict Protection

Use `updated_at` as the conflict token.

When the app loads cloud data:

- fetch the signed-in user's row
- store the returned `data`
- store the returned `updated_at` locally as `cloudUpdatedAt`
- store a localStorage copy for offline viewing
- update the footer, for example `Updated just now`

When the app saves cloud data, update only if Supabase still has the same `updated_at` value this device last loaded:

```js
const nextUpdatedAt = new Date().toISOString();

const { data, error } = await supabase
  .from("health_dashboard_data")
  .update({ data: nextDashboardData, updated_at: nextUpdatedAt })
  .eq("user_id", currentUser.id)
  .eq("updated_at", cloudUpdatedAt)
  .select("updated_at")
  .single();
```

If no row is returned, another device has saved newer cloud data. Block the save and show:

```text
Cloud changed on another device. Tap Refresh before saving again.
```

Do not silently overwrite newer cloud data from another device.

## Manual Refresh

Manual refresh should reload the full JSON blob from Supabase. It does not need record-by-record syncing for this app.

The refresh action should:

- fetch the signed-in user's row
- replace local app state with the cloud copy
- write the cloud copy to localStorage
- update `cloudUpdatedAt`
- update the footer status

This is simple and reliable for a personal health dashboard.

## Offline Behaviour

Offline mode should be read-only.

If the app is offline or Supabase loading fails:

- load the last localStorage copy
- show the saved dashboard data
- disable editing controls
- show a calm message such as `Offline: viewing saved data`

Do not allow offline editing unless a proper conflict/merge strategy is built.

## Auth UX

- Use email/password as the primary day-to-day method.
- Support magic link as an optional secondary method.
- Limit access to Ben and Angelika only.
- Use controlled account creation rather than a public sign-up flow.
- Create the approved accounts deliberately, then keep sign-ups closed/controlled.
- For private magic links, use `shouldCreateUser: false` once accounts exist.
- Handle magic-link rate limits with a clear message before another link can be requested.
- Make password paste and password-manager support work properly on iPhone and iPad Safari.
- Persist the session sensibly on trusted personal devices.
- Keep sign out in the bottom account/sync footer.

## First Cloud Data

Start the Supabase version fresh. Do not migrate local browser data into Ben or Angelika's first cloud accounts unless explicitly requested later.

Each person should get a clean private dashboard the first time they sign in.

## PWA Option

A PWA is still a website, but it can be added to the iPhone/iPad home screen and feel more app-like. It can have an app icon, launch full-screen, keep a persistent session, and cache the app shell so it opens reliably.

Recommendation: make the hosted version PWA-ready, but keep offline mode read-only. That gives the convenience of an app without adding risky offline editing or sync conflicts.

The local project now includes a web app manifest, PNG/SVG app icons, and service worker shell cache. Service workers only run from hosted HTTP/HTTPS pages, so full install behaviour will appear after deployment rather than from the local `file://` page.

## Versioning And Cache Busting

Every release should bump:

- visible footer version, for example `v0.15`
- script/style query strings
- service worker cache name

This helps mobile Safari, iPad, and installed PWA versions pick up the latest build.

## Import Workflow

1. Export the ChatGPT briefing from the dashboard.
2. Upload that briefing plus the lab report to ChatGPT.
3. ChatGPT returns strict JSON using the app import schema.
4. The dashboard shows an import confirmation screen.
5. The user confirms the import.
6. The app saves accepted measurements and skips exact duplicates.

## Backup Requirement

GitHub backs up the app code. Supabase stores the live user data, so it needs a separate backup.

Use `BACKUP_PLAN.md` as the detailed backup implementation guide.

For the JSONB-first model, the primary backup should be JSON because the whole dashboard state lives in one JSON blob per user. CSV exports are still useful for review, spreadsheet work, or checking measurements manually.

The backup system should use a local Python script on the Mac which:

- connects to Supabase using a private service-role key
- downloads `health_dashboard_data`
- saves a full JSON backup file named `health-dashboard-backup.json`
- optionally saves CSV review files for tabular measurement data
- saves a plain-English summary text file
- includes exported timestamp and app version

Store the backup in Dropbox under:

```text
Dropbox/Health Dashboard Backups/
```

Backups should be stored in dated folders, and those dated folders should be treated as the source of truth:

```text
Health Dashboard Backups/daily/2026-06-29-1800
```

The script can also try to maintain a `latest-scheduled` folder, but this is best effort only. Dropbox may block or delay automatic overwrites. That is not critical because the dated folders are the reliable backup record.

## Automatic Backup Schedule

A macOS LaunchAgent should run the backup automatically.

It should be configured to try:

- when the Mac loads the schedule
- every hour
- 07:00
- 12:00
- 18:00
- 00:00

The repeated attempts are deliberate because the Mac may be off, asleep, offline, or unable to reach Dropbox/Supabase at any single scheduled time.

The script should keep a local success marker on the Mac. Once a successful backup has been created for that day, later scheduled runs should skip.

## Recovery Use

If the app or database breaks, use the dated Dropbox backup folder to inspect or rebuild the data.

The most important recovery file is `health-dashboard-backup.json`. CSV files are useful because they can be opened directly in Excel.

## What Needs Protecting

The Supabase service-role key must not be uploaded to GitHub. It stays only on the Mac in the backup tool folder.
