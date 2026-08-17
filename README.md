# Preventative Health Dashboard

A private two-person health dashboard for Ben and Angelika, focused on prevention, due checks and long-term trends. Blood and urine tracking excludes STI and immunoserology tests.

## Live app

The production dashboard is available at [benashy.github.io/health-tracker](https://benashy.github.io/health-tracker/). Health data is stored in each signed-in user's private Supabase row, not in the public GitHub Pages files.

## Main capabilities

- Separate Supabase accounts and independent data for Ben and Angelika
- Password sign-in with magic link as a fallback
- Manual measurements, completion-style health checks and per-user reference or target fields
- Current snapshot, due schedule, grouped results, archive and trend charts
- Practical warning windows and 09:00 Europe/Lisbon Telegram reminders
- Telegram-only snoozes, while the dashboard continues to show the truthful due state
- ChatGPT review-file import with validation, preview and pagination
- AI review and CSV exports
- Portable full-account backup and previewed restore
- Offline viewing from the last local cache, with editing disabled
- PWA shell for iPhone, iPad and desktop

## Local development

Serve the repository over HTTP rather than opening the file directly:

```sh
python3 -m http.server 8791 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8791/`. The checked-in `supabase-config.js` contains only the public browser configuration. Private service keys and Telegram credentials remain server-side or in private Mac configuration.

## Verification

Install the development dependency once, then run the complete checks:

```sh
pnpm install
pnpm exec playwright install chromium webkit
pnpm test
```

The function suite covers health calculations, due logic, imports, date handling, backup validation, undo and Telegram conflict protection. Playwright checks the signed-out desktop and iPhone presentation and versioned app assets. The same checks run in GitHub Actions.

## Recovery

Use `Data > Download full backup` for a portable account-level recovery file. The separate Mac backup tool exports the Supabase tables to dated Dropbox folders. Setup and restore guidance is in [docs/BACKUP_AND_RECOVERY.md](docs/BACKUP_AND_RECOVERY.md).

Deployment and rollback guidance is in [docs/RELEASE_RUNBOOK.md](docs/RELEASE_RUNBOOK.md). Current deferred work is tracked in [NEXT_STEPS.md](NEXT_STEPS.md).

This is a personal record-keeping tool, not a diagnostic system.
