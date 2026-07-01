# Backup Plan

## Purpose

GitHub stores the app code. Supabase stores the live health dashboard data. The database therefore needs its own independent backup outside both GitHub and Supabase.

The backup system should run locally on the Mac and save recovery copies into Dropbox.

## Backup Tool

Use a local Python script.

The script should:

- connect to Supabase using a private service-role key
- download `health_dashboard_data`
- save one full JSON database export
- save CSV files for tabular review
- save a plain-English summary text file
- write the backup into a dated Dropbox folder
- include exported timestamp and app version

The service-role key is powerful and private. It must stay on the Mac and must never be uploaded to GitHub or exposed in browser code.

## Dropbox Location

Backups should be saved under:

```text
Dropbox/Health Dashboard Backups/
```

Dated folders are the reliable backup record and should be treated as the source of truth, for example:

```text
Health Dashboard Backups/daily/2026-06-29-1800
```

Each dated folder should contain:

```text
health-dashboard-backup.json
health_dashboard_data.csv
backup-summary.txt
```

The most important recovery file is:

```text
health-dashboard-backup.json
```

CSV files are useful because they can be opened directly in Excel or inspected manually.

## Latest Folder

The backup tool can also try to maintain:

```text
Health Dashboard Backups/latest-scheduled
```

This is convenient, but it is not the source of truth. Dropbox may block or delay automatic overwrite of that folder. If that happens, it is not critical because the dated backup folders are the reliable recovery record.

## Automatic Schedule

A macOS LaunchAgent should run the backup automatically.

It should try to run:

- when the Mac loads the schedule
- hourly
- 07:00
- 12:00
- 18:00
- 00:00

The repeated attempts are deliberate because the Mac may be off, asleep, offline, or unable to reach Dropbox/Supabase at any single scheduled time.

## Duplicate Prevention

The script should keep a local success marker on the Mac. Once a successful backup has been created for that day, later scheduled runs should skip.

The success marker should stay local to the Mac backup tool folder. It does not need to be stored in GitHub.

## Recovery Use

If the app or database breaks, use the dated Dropbox folder to inspect or rebuild the data.

For the JSONB-first Supabase model, restoring from `health-dashboard-backup.json` should be enough to recreate each user's `health_dashboard_data` row. CSV files are secondary review aids rather than the primary restore source.
