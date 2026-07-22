# Health Tracker Outstanding To-Do List

Last updated: 2026-07-22

When Ben asks "what items are outstanding?", read this file first and use it as the current project to-do list.

## Current Status

- GitHub repo is live: `Benashy/health-tracker`.
- GitHub Pages is live: `https://benashy.github.io/health-tracker/`.
- Supabase login and per-user cloud saving are in place.
- Ben and Angelika both have separate accounts and initial profile details.
- The app is now on `v0.55`.
- The app is usable for early real-world testing, with a calmer first-use flow, improved measurement entry, grouped current results, archive view, trend charts, import review, AI review export, current snapshot, metric context notes, and a more cautious actionability layer.
- A live Supabase privacy/security audit has been completed and recorded in `PRIVACY_SECURITY_AUDIT.md`.

## Completed In v0.55

- Kept the signed-in desktop/tablet top menu actions on one row so `Telegram` no longer drops below `Export CSV`.
- Compact desktop header action spacing without changing the mobile Menu flow.

## Completed In v0.54

- Added a locked boot state so refresh/login loads cannot briefly show dashboard, Telegram, export, import, or health-result surfaces before auth resolution.
- Changed the privacy guard so it can hide and clear unauthorised sessions, but only the main app can reveal private dashboard content after the correct user's cloud data has loaded.
- Marked import-review and metric-context modals as private surfaces.
- Made Pilot medical, Eye test, and Dermatology checkup use editable next-due/expiry fields with sensible defaults from the completed date.
- Added clear `added to tracker` save feedback and a short submit lockout to reduce accidental duplicate entries.
- Kept health checks grouped under `Health checks`, with Pilot medical displaying as an expiry and Eye/Dermatology as next-due items.
- Added future roadmap note for age-based ECG and audiogram cycles as part of Ben's pilot medical reminders.

## Completed In v0.53

- Fixed the Telegram settings modal flash on login by preventing the privacy guard from opening private modals automatically.
- Reworked Pilot medical, Eye test, and Dermatology checkup as completion-style health checks rather than lab-style measurements.
- Hid reference setup, value, and unit fields for those completion-only health checks.
- Added a manual expiry/next-due date field for Ben's UK CAA pilot medical.
- Set Eye test and Dermatology checkup to calculate their next due dates from the completed date entered.
- Added a dedicated `Health checks` group in the Results section.
- Added completion, next due date, and expiry date metadata to CSV/GPT-style exports and imports.
- Updated the Telegram reminder backend to respect manually-entered pilot medical expiry dates and completion-date-based health-check cycles.

## Completed In v0.52

- Added Ben-only annual UK CAA pilot medical tracking.
- Set Ben's pilot medical first expiry/due date to 14 July 2027, with a six-week dashboard warning window.
- Added custom Telegram milestone reminders for the pilot medical at six weeks, one month, two weeks, one week, one day, and once expired.
- Added two-year eye test tracking for Ben and Angelika, first due on 1 June 2027.
- Added annual dermatology checkup tracking for Ben and Angelika, first due on 1 July 2027.
- Added initial fixed calendar recurrence support for annual/two-year health checks; revised in v0.54 for completion-date-based checks.

## Completed In v0.51

- Fixed the Telegram reminders modal so normal sign-in, refresh, and dashboard render keep it closed.
- Added explicit Telegram modal open state so the panel only opens from the Telegram menu/button.
- Updated the due-test dashboard status to clarify that snooze buttons are included when due checks are present.

## Completed In v0.50

- Added Telegram inline snooze buttons to due-reminder messages.
- Added `Snooze all 3d` and `Snooze all 7d` Telegram actions.
- Added group-specific next-cycle snooze buttons, with visible cycle labels such as 14d, 30d, 3m, 6m, and 12m.
- Switched Telegram pairing from `getUpdates` polling to webhook-captured pairing codes, so the bot can support inline button callbacks.
- Added a private `health_dashboard_telegram_pairing_codes` table for temporary Telegram pairing codes.
- Added a Vault-backed Telegram webhook secret and restricted webhook-secret helper functions.
- Added a protected webhook configuration/status action for the Telegram Edge Function.

## Completed In v0.49

- Fixed the Telegram reminder modal so it no longer opens automatically after sign-in or refresh.
- Reordered the mobile bottom navigation to `Home`, `Menu`, `Add`, `Trends`, `Results`.
- Improved the iPhone account/sync footer so sync status sits above the refresh, version, and sign-out controls.
- Deployed Telegram Edge Function version 5 with a protected scheduled-reminder action.
- Added a private server-side `health_dashboard_telegram_reminder_state` table so daily reminder bookkeeping does not modify the main dashboard JSON or trigger avoidable cloud conflicts.
- Added a Vault-backed scheduler credential and a restricted `health_tracker_cron_secret_matches` function so the scheduled reminder endpoint is not publicly triggerable.
- Enabled Supabase Cron and pg_net for the Health Tracker project.
- Scheduled `health-tracker-telegram-reminders` at `0 8,9 * * *`, with the Edge Function only sending when the local Europe/Lisbon hour is 09:00.
- Added protected scheduled-reminder dry-run support and verified the path without sending actual Telegram messages.
- Updated Telegram reminder summaries to include cycle labels such as `14-day cycle`, `30-day cycle`, `3-month cycle`, `6-month cycle`, and `12-month cycle`.

## Completed In v0.48

- Moved Telegram reminders out of the dashboard homepage and into a private Telegram management view.
- Added desktop and mobile Menu entry points for Telegram settings.
- Added connected/paused status, Send test, Send due test, Pause/Resume reminders, and Disconnect with confirmation.
- Added private reminder-state fields for enabled/paused status, due-test timestamp, last-reminder metadata, and future snooze state.
- Added visible next-cycle labels for future snooze choices, such as 14 days, 30 days, 3 months, 6 months, 12 months, and 5-10 years.
- Removed redundant “no health values” wording from Telegram reminder messages.
- Split VO2 max into its own fitness reminder group so it can follow a three-month cycle instead of the monthly vitals cycle.
- Kept automatic Supabase Cron reminders disabled until the manual reminder state has been tested.

## Completed In v0.47

- Created the first Health Tracker Telegram Edge Function in Supabase.
- Added a signed-in Telegram setup panel that pairs a user with Health Tracker Bot using a temporary one-time code.
- Confirmed Ben and Angelika can each pair their own dashboard account to their own Telegram chat through the same Health Tracker bot.
- Added a harmless test-message flow so Telegram delivery can be verified before scheduled health reminders are enabled.
- Added a manual due-summary test flow that reads the signed-in user's own dashboard data, groups due checks, and sends a privacy-safe Telegram reminder without health values.
- Kept the Telegram bot token server-side in Supabase secrets via `HEALTH_TRACKER_TELEGRAM_BOT_TOKEN`.
- Added cache-busting updates for the new app version.

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

1. Polish Telegram due reminders after real-world testing.
   - Health Tracker now has a dedicated Telegram bot created through BotFather, so reminders stay in their own Telegram chat.
   - Use one Telegram bot/chat per project going forward, but keep the underlying reminder architecture reusable so other personal apps can adopt the same pattern quickly.
   - Do not put the Telegram bot token in GitHub Pages, browser JavaScript, or any public file.
   - Monitor the first few 09:00 scheduled reminders to confirm the message timing and grouping feel calm.
   - Keep the reminder time fixed at 09:00 UK/Lisbon time for now.
   - Later consider letting each user choose reminder time and timezone.
   - Review whether the first snooze button wording feels right after Ben and Angelika use it in real reminders.

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
   - Later add age-based ECG and audiogram cycles as part of Ben's pilot medical planning once the CAA frequency details are supplied.
   - Later consider linking Ben's eye-test due date to sit roughly one month before the pilot medical renewal when dates change.

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
