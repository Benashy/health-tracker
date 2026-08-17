# Backup and recovery

The live dashboard data is held in Supabase. GitHub protects the application code, but it is not a database backup.

## Available recovery copies

1. **In-app full backup:** `Data > Download full backup` creates a portable JSON file for the signed-in account. `Restore full backup` validates and previews that file, downloads a safety copy of the current account, then replaces it only after cloud saving succeeds.
2. **Supabase Pro backups:** the managed database backup is the first infrastructure recovery route.
3. **Independent Dropbox backup:** `tools/backup_health_dashboard.py` exports the important Supabase tables as one JSON file, separate CSV files and a plain-English summary.

## Activating the Dropbox schedule

The private service-role key must never be placed in this repository or browser code.

1. Create `~/.health-dashboard-backup/config.json` from `tools/backup-config.example.json`.
2. Put the Supabase URL and private service-role key in that private file.
3. Set the file permissions to owner-only: `chmod 600 ~/.health-dashboard-backup/config.json`.
4. Run `tools/backup_health_dashboard.py --force` once and inspect the dated Dropbox folder.
5. Run `tools/install_backup_schedule.sh` to install the Mac LaunchAgent.

The LaunchAgent tries at login, hourly, and at 00:00, 07:00, 12:00 and 18:00. After one successful backup in a calendar day, later attempts skip. Dated folders under `Health Dashboard Backups/daily/` are the source of truth. Updating `latest-scheduled` is best effort because Dropbox can temporarily lock it.

## Restore drill

Do not wait for an incident to test recovery.

1. Confirm the latest dated folder contains `health-dashboard-backup.json`, both CSV files and `backup-summary.txt`.
2. Confirm the JSON opens and includes both configured database tables.
3. Use a separate Supabase test project for a full database restore rehearsal. Do not overwrite the live project during a drill.
4. Record the drill date and outcome in the private backup folder.

The browser restore function accepts only the app-generated account backup format. Database-level Dropbox backups are intended for controlled inspection and reconstruction.
