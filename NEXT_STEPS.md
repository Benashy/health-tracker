# Health Tracker Outstanding To-Do List

Last updated: 2026-07-08

When Ben asks "what items are outstanding?", read this file first and use it as the current project to-do list.

## Current Status

- GitHub repo is live: `Benashy/health-tracker`.
- GitHub Pages is live: `https://benashy.github.io/health-tracker/`.
- Supabase login and per-user cloud saving are in place.
- Ben and Angelika both have separate accounts and initial profile details.
- The app is currently usable for early testing, but the UI and workflows still need polish before heavy real-world use.

## Highest Priority

1. Test real use with a small number of genuine entries.
   - Add weight, waist circumference, blood pressure, and a few representative blood markers for Ben and Angelika.
   - Use this to identify friction in the real workflow before adding lots of data.

2. Polish metric entry.
   - Make the add-measurement flow calmer and faster.
   - Keep body metrics, blood/urine results, cardiovascular markers, fitness metrics, and one-off investigations easy to distinguish.
   - Keep weight and waist as target-based metrics, not clinical reference-range metrics.
   - Preserve per-person, per-metric reference ranges and targets with explicit edit controls.
   - Continue to avoid redundant fields that make manual entry feel heavy.

3. Improve trends and charts.
   - Make previous result, latest change, percentage change, highest, lowest, and trend direction easier to scan.
   - Add clearer 6-month, 12-month, year-on-year, and all-time comparisons where enough data exists.
   - Keep trend language calm and non-diagnostic.

4. Review privacy and security.
   - Re-check Supabase Row Level Security.
   - Confirm each signed-in user can only see their own health data.
   - Confirm only Ben and Angelika can use the live app.
   - Keep private health data out of GitHub and browser-visible code.

## Medium Priority

5. Build the ChatGPT import workflow.
   - Export all current app context in a ChatGPT-friendly format.
   - Use that export to instruct ChatGPT how to read an uploaded blood/urine PDF.
   - Have ChatGPT return structured JSON.
   - Show an import confirmation screen before saving.
   - Never import STI or immunoserology results.

6. Improve the Current Health Snapshot.
   - Add a first-page summary after login.
   - Include current priorities, overdue items, reassuring results, recent changes, and latest key metrics.
   - Keep it preventative, not diagnostic.

7. Improve mobile and tablet UI.
   - Make iPhone and iPad layouts first-class.
   - Reduce table heaviness on small screens.
   - Keep account, sync, refresh, version, and sign-out controls in the bottom footer.

8. Add health events and notes.
   - Add a per-user timeline.
   - Support categories such as investigations, procedures, clinician notes, medication/supplement changes, lifestyle milestones, and aviation medical events.
   - Allow GP/clinician notes per user.

## Later

9. Add document upload/storage.
   - Use Supabase Storage for original PDFs and source documents.
   - Attach documents to blood results, timeline events, metrics, or profiles where useful.

10. Add reminders and review scheduling.
   - Keep reminders cautious and not excessive.
   - Include annual bloods, home measurements, GP reviews, ECG, CAC consideration, and abnormal-result follow-up.

11. Add backup scheduling.
   - Use the backup process below.
   - Store backups in Dropbox under `Dropbox/Health Dashboard Backups/`.

12. Consider structured database tables later.
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
