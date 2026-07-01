# Deployment Handoff

## Current Parked State

- App version: `v0.15`.
- Current app still runs locally with browser localStorage when Supabase is not configured.
- Cloud login/sync code is present and activates once `supabase-config.js` contains the project URL and public anon key.
- Next work should create the GitHub repo and Supabase project, then fill the config.
- Start fresh in Supabase; do not migrate local browser data unless explicitly requested later.
- Ben and Angelika should have separate private accounts.
- Access should be restricted to Ben and Angelika only.
- Email/password is the main login method.
- Magic link is a backup login method.
- PWA support is included: manifest, app icon, service worker cache, and mobile metadata.
- Supabase Auth/cloud-sync scaffolding is included and waits for `supabase-config.js` to be filled with the project URL and public anon key.

## Deployment Path Next Time

1. Create or connect the GitHub repository.
2. Create the Supabase project.
3. Run `supabase/health_dashboard_data.sql`.
4. Configure Supabase Auth for private Ben and Angelika accounts.
5. Keep public sign-up closed or controlled.
6. Fill `supabase-config.js` with the Supabase project URL and public anon key.
7. Test the existing Supabase wiring: one JSONB dashboard row per user.
8. Confirm `updated_at` blocks stale saves from another device.
9. Keep offline mode read-only.
10. Deploy the frontend, then test on desktop, iPhone, and iPad.
11. Set up the Dropbox backup process under `Dropbox/Health Dashboard Backups/`.
12. Use dated backup folders as the source of truth; treat `latest-scheduled` as best effort only.

## Files To Use

- `SUPABASE_PLAN.md` for architecture and sync behaviour.
- `supabase/health_dashboard_data.sql` for the first Supabase schema and RLS policies.
- `NEXT_STEPS.md` for the implementation checklist.
- `HEALTH_DASHBOARD_SPEC.md` for scope and product decisions.
- `BACKUP_PLAN.md` for the Dropbox backup process and recovery notes.

## Final Local Checks

Before parking, run:

```text
node --check app.js
node --check service-worker.js
node --check work/function-test.js
node work/function-test.js
```

The expected result is `function test passed`.
