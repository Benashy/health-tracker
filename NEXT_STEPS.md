# Health Tracker Outstanding To-Do List

Last updated: 2026-07-21

When Ben asks "what items are outstanding?", read this file first and use it as the current project to-do list.

## Current Status

- GitHub repo is live: `Benashy/health-tracker`.
- GitHub Pages is live: `https://benashy.github.io/health-tracker/`.
- Supabase login and per-user cloud saving are in place.
- Ben and Angelika both have separate accounts and initial profile details.
- The app is now on `v0.45`.
- The app is usable for early real-world testing, with a calmer first-use flow, improved measurement entry, grouped current results, archive view, trend charts, import review, AI review export, current snapshot, metric context notes, and a more cautious actionability layer.
- A live Supabase privacy/security audit has been completed and recorded in `PRIVACY_SECURITY_AUDIT.md`.

## Completed In v0.45

- Fixed a mobile CSS privacy bug where the signed-out iPhone layout could visually show the mobile Menu panel despite it being marked private/hidden.
- Added signed-out CSS hardening so all `data-private` sections, the mobile action bar, and the mobile menu stay hidden before authentication.
- Added JavaScript guards so mobile navigation and menu actions cannot render or run before sign-in.
- Repaired the signed-out desktop login layout so email, password, and sign-in actions align cleanly inside the narrower login shell.

## Completed In v0.44

- Replaced the favicon/app icon with the approved green Health Dashboard mark and proportional white first-aid cross.
- Regenerated the favicon, iPhone/PWA icons, SVG icon, and service-worker cache references.
- Reworked the iPhone layout into app-style screens: Home, Add, Trends, Results, and Menu.
- Moved mobile export/import/AI/CSV actions into the Menu screen so the Home view stays calm and private.
- Kept the desktop layout unchanged apart from the shared icon/version update.

## Completed In v0.42

- Hardened magic-link sign-in so links request the canonical live dashboard URL instead of preserving local or query-string URLs.
- Added a clearer message for expired or invalid magic-link redirects.
- Added regression tests to ensure magic links do not redirect to localhost.

## Completed In v0.41

- Added dedicated browser favicon assets for the Health Dashboard: `favicon.ico`, `favicon-16.png`, `favicon-32.png`, `favicon-48.png`, and `favicon-64.png`.
- Added explicit favicon links in the page head so browsers are less likely to retain the old JumpSeat favicon.
- Added the favicon assets to the service-worker cache and bumped the app cache tag to force a browser refresh.

## Completed In v0.40

- Replaced the old favicon/app icon with a minimal green Health Dashboard icon.
- Added a white first-aid style cross so the icon reads clearly at small favicon and app-icon sizes.
- Regenerated the SVG, 180px, 192px, and 512px icon assets.
- Bumped app, manifest, and service-worker cache tags so browsers request the new icon.

## Completed In v0.39

- Simplified the signed-out page so it only shows the app title, version, and account/sign-in block.
- Hid sync, refresh, local-draft, export, import, CSV, and AI review affordances until authentication is complete.
- Made measurement value entry visually more prominent than reference/target setup fields.
- Added independent lower reference, target, and upper reference field selection per person/metric.
- Migrated existing weight/waist targets into a dedicated `target_value` field while preserving historical targets.
- Extended import/export data to include `target_value` and reference-field selections.

## Completed In v0.38

- Added a near-PWA/mobile-native pass for iPhone.
- Added a mobile-only bottom action bar for Current, Due, Add, and AI Review.
- Added a sticky mobile Add to tracker affordance inside measurement entry.
- Improved mobile empty states with clear next-action buttons.
- Improved due cards with clearer tap-to-enter and snooze-alignment language.
- Added iPhone safe-area spacing and bottom-sheet-style mobile modals.
- Refreshed manifest icon cache tags and PWA start URL cache-busting.

## Completed In v0.37

- Added proper iPhone optimisation without changing the desktop table layout.
- Results now render as labelled cards on iPhone-sized screens instead of relying on horizontal table scrolling.
- Tightened mobile snapshot, overview, quick metric, filter, footer, and chart spacing.
- Kept standard iPhones on useful two-column snapshot/overview grids, with a one-column fallback only for very small screens.

## Completed In v0.36

- Moved signed-in account status, profile details, current snapshot, overview tiles, and due soon into the preferred page order.
- Changed the default current snapshot to Weight, Waist circumference, LDL, and Total cholesterol.
- Added per-user editable snapshot metrics, saved into the dashboard settings.
- Removed the add-measurement follow-on prompt such as `Next: Waist circumference`.

## Completed In v0.35

- Reworked the current snapshot into an actionable focus panel for waist circumference, weight, total cholesterol, and LDL.
- Kept Lipoprotein(a) visible as inherited cardiovascular risk context instead of counting it as an active range warning.
- Added noise-aware trend rules so small in-range blood pressure changes and small lipid variations are not over-labelled as worsening.
- Updated AI exports to separate active warnings from risk-context markers.

## Completed In v0.34

- Small real-use friction cleanup.
- Metric-entry polish, including entry helper text and next-metric flow for common paired measurements.
- Trend/chart polish, including two-year range, year-on-year comparison, and average over the selected range.
- ChatGPT import confirmation polish, including skipped-item detail and disabled confirmation for empty imports.
- `Prepare AI Review` workflow, replacing the older review-pack wording with clearer AI review instructions and guardrails.
- Current Health Snapshot after login.
- Metric medical context UI using the first-pass context note library.
- Live Supabase security/privacy audit and grant tightening.

## Current Outstanding Work

1. Add Telegram due reminders.
   - Treat this as the next highest-priority feature.
   - Use a Telegram bot created through BotFather.
   - Do not put the Telegram bot token in GitHub Pages, browser JavaScript, or any public file.
   - Store the bot token securely in Supabase secrets/Vault.
   - Add per-user Telegram `chat_id` settings so Ben and Angelika can receive separate private reminders.
   - Use Supabase Cron to call a Supabase Edge Function on a daily schedule.
   - The Edge Function should inspect each user's due/overdue metrics and send a low-detail privacy-safe Telegram message.
   - Avoid sending health values, DOB, or sensitive clinical detail in Telegram by default.
   - Add duplicate prevention with `last_notified` or equivalent, so the same due item does not nag repeatedly.
   - Include a test-send mode before enabling the daily scheduled reminder.

2. Continue tablet and post-use mobile refinement.
   - Test on Ben's real iPhone/iPad after a few data-entry sessions.
   - Refine any Safari/PWA keyboard, scrolling, or installed-app quirks found in real use.
   - Keep account, sync, refresh, version, and sign-out controls in the bottom footer.

3. Add health events and notes.
   - Add a per-user timeline.
   - Support categories such as investigations, procedures, clinician notes, medication/supplement changes, lifestyle milestones, and aviation medical events.
   - Allow GP/clinician notes per user.

4. Add document upload/storage.
   - Use Supabase Storage for original PDFs and source documents.
   - Attach documents to blood results, timeline events, metrics, or profiles where useful.

5. Add in-app reminders and review scheduling.
   - Keep reminders cautious and not excessive.
   - Include annual bloods, home measurements, GP reviews, ECG, CAC consideration, and abnormal-result follow-up.
   - Add a Ben-only annual pilot medical reminder as a due-date-only item, with no pass/fail tracking required.
   - Add a two-yearly eye test reminder available to every user.
   - For Ben, allow the eye test due date to be aligned roughly one month before the annual pilot medical once the pilot medical due date is known.

6. Add backup scheduling.
   - Use the backup process below.
   - Store backups in Dropbox under `Dropbox/Health Dashboard Backups/`.

7. Consider structured database tables later.
   - Keep the current simple per-user JSONB row while the app is evolving.
   - Move to structured tables only if reporting, audit trails, or complex querying becomes important.

## Standing Design Rules

- Prevention over diagnosis.
- Trends over isolated values.
- Avoid unnecessary testing.
- Escalate investigations only when first-line markers justify it.
- Keep blood and urine tracking only.
- Continue excluding STI and immunoserology tests.
- Do not add BMI as a primary tracked metric. If added later, keep it calculated-only and secondary.
- Keep Ben and Angelika's data private and separate.
- Use visible versioning and cache-busting on every release.
- Support offline viewing as read-only unless robust conflict handling is added.
- Protect against overwriting newer cloud data from another device.

## Backup Process

The app's live data is stored in Supabase, not in the GitHub website files. GitHub backs up the app code, but the actual user data needs a separate backup.

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
