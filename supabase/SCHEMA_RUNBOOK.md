# Supabase schema runbook

The project uses one private JSON dashboard row per authenticated user, plus server-side Telegram pairing and reminder-state objects.

## Canonical sources

- `health_dashboard_data.sql`: dashboard table, row-level access rules and approved-user account policy
- `telegram_reminder_schedule.sql`: Telegram pairing, reminder state, protected scheduler helpers and Cron setup
- `functions/health-tracker-telegram/index.ts`: Telegram pairing, test messages, scheduled reminders and snooze callbacks

These files are the reviewable source of truth. Do not paste browser keys, service-role keys, Telegram tokens, Vault values or private user data into migrations, logs or GitHub issues.

## Change procedure

1. Take a current database backup.
2. Review the SQL change separately from application code.
3. Apply it to a test project where practical.
4. Verify tables, policies, grants, functions and Cron jobs explicitly.
5. Apply to production, then run a read/write test as each permitted user without inspecting the other user's data.
6. Record the applied change and recovery route.

The current v0.81 release changes no database schema. Telegram snooze conflict protection is implemented in the Edge Function using the dashboard row's existing `updated_at` value.
