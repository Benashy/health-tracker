# Health Tracker Outstanding To-Do List

Last updated: 2026-08-17

When Ben asks "what items are outstanding?", read this file first and use it as the current project to-do list.

## Current Status

- GitHub repo is live: `Benashy/health-tracker`.
- GitHub Pages is live: `https://benashy.github.io/health-tracker/`.
- Supabase login and per-user cloud saving are in place.
- Ben and Angelika both have separate accounts and initial profile details.
- The app is now on `v0.78`.
- The app is usable for early real-world testing, with focused Home, Add, Trends and Results workspaces, compact grouped results, paginated history, import review, AI review export, current snapshot, metric context notes, and a cautious actionability layer.
- A live Supabase privacy/security audit has been completed and recorded in `PRIVACY_SECURITY_AUDIT.md`.

## Completed In v0.78

- Corrected the final iPhone layout refinements after live testing: compact profile Edit placement, horizontal result filters, non-wrapping quick metrics, and a cleaner Details row.
- Bumped every cache marker so installed browsers and the service worker receive the refined mobile CSS immediately.

## Completed In v0.77

- Introduced shared Home, Add measurement, Trends and Results navigation across desktop, tablet and mobile.
- Replaced the very long current-results surface with collapsible clinical groups and compact metric rows that reveal full detail on demand.
- Added pagination to the Results Archive, with 20 historical entries per page.
- Reordered Trends so the chart appears before supporting statistics, with secondary statistics in a collapsible section.
- Simplified Add measurement by making Value visually dominant, presenting the unit as a quiet suffix, balancing quick metrics, and moving tracking controls into Details.
- Compressed the signed-in profile into a clear identity row and moved reminder-planning detail into a collapsed disclosure.
- Grouped import, AI review and export under a Data menu while retaining Telegram and Vitamins as separate utilities.
- Added consistent local Lucide icons, lighter typography, clearer selected states, keyboard selection state, larger mobile touch targets and reduced-motion support.
- Preserved the private signed-out screen, cloud data structure, health calculations, due logic and Telegram behaviour.

## Completed In v0.76

- Applied the approved Colour Clinical design across the dashboard without changing health data, privacy rules, calculations, or workflows.
- Added a compact branded header using the Health Dashboard icon and lighter typography.
- Rebalanced the palette so green carries product identity, blue identifies navigation and scheduling, and amber/red remain reserved for health cautions and warnings.
- Reduced heavy shadows and font weights, introduced fine dividers, and refined cards, forms, results, trends, modals, and mobile navigation.
- Updated the PWA theme colours and cache-busting release markers.

## Completed In v0.75

- Added a 1-day Telegram snooze button for due-reminder messages.
- Changed dashboard due calculations so Telegram snoozes no longer hide due or overdue checks inside the app.
- Removed the misleading in-app due-card snooze control, keeping snooze as a Telegram reminder action only.
- Updated due-list copy to make clear that checks remain due until the measurement or health check is entered.

## Completed In v0.74

- Added Ben's IM8 Daily Ultimate Essentials as `IM8 Daily Essentials` in the Vitamins organiser.
- Added Ben's IM8 Daily Ultimate Longevity as `IM8 Daily Longevity` in the Vitamins organiser.
- Placed both IM8 items in the breakfast timing group, after the upon-waking fexofenadine entry.
- Updated fexofenadine to show the 120 mg tablet dose.
- Added notes so the Today view makes the fexofenadine gap clear before breakfast/IM8.

## Completed In v0.72

- Redesigned Add measurement into a calmer quick-entry flow with a collapsible details panel.
- Reference/target setup now opens automatically when a metric needs first-time setup, then collapses again for repeat entries.
- Added compact grouped Results cards for everyday `Current`, `Cautions`, `Warnings`, and `Due` views while keeping the full table in `Archive`.
- Added due-check cards in the Results `Due` view so baseline-due items are visible even before any result has been entered.
- Added a visible reminder-planning summary showing app warning windows and Telegram milestone timing by metric cycle.
- Added tablet/iPad layout refinements so the entry form, results, due cards, and reminder planning breathe properly before the phone layout takes over.

## Completed In v0.71

- Changed the Vitamins module into a cleaner two-view switch: `Today` and `Timetable`.
- `Today` now shows only today's tablets and hides the weekly timetable and expanded schedule.
- `Timetable` restores the weekly packing timetable and expanded schedule.

## Completed In v0.70

- Added a Vitamins `Today` button for the non-packing use case.
- The Today view shows only the current day's tablets, grouped by timing, with quantity and key notes visible.
- Today view items and weekly timetable items both remain clickable/tappable for dosage confirmation.
- Kept the weekly timetable intact as the packing view.

## Completed In v0.69

- Tidied Ben's Vitamins schedule by shortening `Lion's Mane (Zenement)` to `Lion's Mane`.
- Renamed the Vitamins sections to `Weekly timetable` and `Expanded schedule`.
- Made weekly timetable items clickable/tappable so the selected item shows its dosage.
- Added a desktop scroll fix so the sticky Add measurement panel can scroll internally when it is taller than the viewport.
- Added a future UX overhaul task for Add measurement and Results.

## Completed In v0.68

- Simplified the Vitamins tab into a plain weekly organiser by removing week-start, Red Yeast Rice date, CoQ10 finished, person selector, and copy controls.
- Moved the Weekly Pill Case Guide above the detailed schedule.
- Set Red Yeast Rice to the Tuesday, Thursday, and Saturday weekly organiser pattern.
- Moved Vitamin D3 + K2 and Zinc to Monday and Friday.
- Split the dashboard summary counts into amber `range cautions` and red `range warnings`.
- Reordered the `Next due` tile so the label appears before the date and relative timing.

## Completed In v0.67

- Added a private `Vitamins` tab for the weekly tablet organiser.
- Populated Ben's organiser with the initial tablet/capsule schedule. IM8 items were added later in v0.74.
- Added a weekly pill case guide, editable next Red Yeast Rice dose date, optional CoQ10 day selection, copy-to-clipboard support, and print-friendly styling.
- Set up Angelika's Vitamins area as available but empty, ready for her supplement schedule to be added later.

## Completed In v0.66

- Added pagination controls to the Due soon panel so all due, overdue, and baseline-due checks can be reviewed page by page instead of only showing the first eight.

## Completed In v0.65

- Added per-user metric tracking controls so a metric can be stopped or restarted without deleting history.
- Active metrics with no first entry now show as `Baseline due`.
- Not-tracked metrics are hidden from active results, trends, due lists, and Telegram reminder calculations while remaining available in the metric dropdown for re-tracking.
- Deployed Telegram Edge Function version 14 so scheduled and test reminders use the same not-tracked metric rules as the dashboard.

## Completed In v0.64

- Simplified the signed-in action menu by removing the older visible `Export for ChatGPT` action and keeping the clearer `Prepare AI Review` workflow.
- Renamed `Export CSV` to `Export results` in the desktop and mobile menus.
- Added a small relative timing line to the `Next due` card, such as `in 10 days`, `due today`, or `overdue by 3 days`.

## Completed In v0.63

- Changed dashboard card hover/selected states to use the recorded blue, keeping green reserved for genuinely in-range/on-target status.
- Added a 2% near-limit buffer around reference limits so values just inside or just outside a lab range show as amber `Near limit`, while clearly abnormal values remain red `Outside range`.

## Completed In v0.62

- Added pagination to the ChatGPT import review screen so large imports can be reviewed page by page before saving, instead of only showing the first 12 measurements.

## Completed In v0.61

- Implemented the agreed reminder warning windows: 14-day checks warn 1 day before, 30-day checks warn 3 days before, 90-day checks warn 7 days before, six-month checks warn 30 days before, annual checks warn 30 days before, two/three-year checks warn 90 days before, and Colonoscopy warns 120 days before.
- Added matching Telegram reminder milestones so scheduled 09:00 reminders can warn at practical booking intervals rather than only on the due date.
- Kept Pilot medical on its custom CAA reminder pattern of 6 weeks, 1 month, 2 weeks, 1 week, 1 day, and once expired.

## Completed In v0.60

- Made reviewed imports force an immediate Supabase save and report whether the cloud save completed, so large ChatGPT imports are not dependent on the delayed background save.
- Moved `Health checks` directly below `Vitals and fitness` in metric ordering.

## Completed In v0.59

- Added shared Colonoscopy tracking for Ben and Angelika as a completion-style health check with a five-year editable next due date.

## Completed In v0.58

- Added Angelika-only Breast screening tracking as a completion-style health check with a two-year editable next due date.

## Completed In v0.57

- Added Angelika-only Pap smear tracking as a completion-style health check with a three-year editable next due date.
- Stabilised the refresh/auth-loading layout so the title does not start in the signed-out/login position and then jump into the dashboard.
- Hid the sync footer/version during the locked boot state so refresh does not briefly show an isolated version chip before the dashboard loads.

## Completed In v0.55

- Kept the signed-in desktop/tablet top menu actions on one row so `Telegram` no longer drops below the results export action.
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
   - Review the new v0.61 warning periods after real reminders have been received: 14-day checks warn 1 day before, 30-day checks warn 3 days before, 90-day checks warn 7 days before, six-month checks warn 30 days before, annual checks warn 30 days before, two/three-year checks warn 90 days before, and Colonoscopy warns 120 days before.
   - Decide separately how each category should continue after the due date has passed, for example daily for short-cycle home readings, weekly for bloods/checks, and monthly for multi-year screening if not yet completed.

2. Move Vitamins schedule into private account data.
   - The Vitamins organiser is currently populated from public app code, which means Ben-specific supplement/medication names, doses, timings, and notes are visible in the public GitHub source.
   - Keep the Vitamins feature itself in the public app, but move each person's actual vitamin schedule into their private Supabase dashboard JSON.
   - Add a small import/edit path for Vitamins so Ben and Angelika can update their own schedules without requiring code changes.
   - Treat the current hard-coded schedule as temporary and migrate it on a privacy pass.

3. Add health events and notes.
   - Add a per-user timeline.
   - Support categories such as investigations, procedures, clinician notes, medication/supplement changes, lifestyle milestones, and aviation medical events.
   - Allow GP/clinician notes per user.

4. Add document upload/storage.
   - Use Supabase Storage for original PDFs and source documents.
   - Attach documents to blood results, timeline events, metrics, or profiles where useful.

5. Add backup scheduling.
   - Use the backup process below.
   - Store backups in Dropbox under `Dropbox/Health Dashboard Backups/`.

6. Consider structured database tables later.
   - Keep the current simple per-user JSONB row while the app is evolving.
   - Move to structured tables only if reporting, audit trails, or complex querying becomes important.

7. Later pilot-medical scheduling refinements.
   - Add age-based ECG and audiogram cycles as part of Ben's pilot medical planning once the CAA frequency details are supplied.
   - Consider linking Ben's eye-test due date to sit roughly one month before the pilot medical renewal when dates change.

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
