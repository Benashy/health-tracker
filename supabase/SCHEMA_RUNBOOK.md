# Supabase schema runbook

The project uses one private JSON dashboard row per authenticated user, plus server-side Telegram pairing and reminder-state objects.

## Canonical sources

- `health_dashboard_data.sql`: dashboard table, row-level access rules and approved-user account policy
- `telegram_reminder_schedule.sql`: Telegram pairing, reminder state, protected scheduler helpers and Cron setup
- `functions/health-tracker-telegram/index.ts`: Telegram pairing, test messages, scheduled reminders and snooze callbacks

These files are the reviewable source of truth. Do not paste browser keys, service-role keys, Telegram tokens, Vault values or private user data into migrations, logs or GitHub issues.

## Explicit Data API grants

From 30 October 2026, Supabase removes automatic Data API grants for new tables in `public`. Existing tables retain their current grants. This matters for new projects, preview branches and any reset or migration that recreates a table. See the [Supabase notice](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).

The canonical setup scripts explicitly grant the access used by this app:

- `health_dashboard_data`: `SELECT`, `INSERT` and `UPDATE` for `authenticated`, with approved-account and owner-scoped RLS policies; `SELECT` and `UPDATE` for `service_role`.
- `health_dashboard_telegram_reminder_state`: `SELECT`, `INSERT` and `UPDATE` for `service_role` only.
- `health_dashboard_telegram_pairing_codes`: `SELECT`, `INSERT`, `UPDATE` and `DELETE` for `service_role` only.
- The three protected Telegram helper functions: `EXECUTE` for `service_role` only.

The dashboard table's server-role permissions support scheduled reminder reads, snooze updates and backup reads. Bypassing RLS does not remove the need for a table grant. Do not add anonymous access, expose the Telegram tables to browser users or reinstate broad automatic grants to make a rebuild work.

For any future fresh-project or rebuild check, use a disposable test project with automatic grants disabled, apply the complete canonical scripts, then inspect effective grants, schema usage and RLS. Confirm that signed-in users can read and save only their own approved-account rows, that anonymous users have no table access, and that server-side reminder reads and snooze updates work. Do not reset production for this test.

### 20 October 2026 review

The read-only production check confirmed the required current table permissions, owner-scoped dashboard RLS and server-only Telegram helper access. No urgent production permission change was required for the notice. A fresh-project rebuild was not performed.

The setup-script correction adds the missing explicit `service_role` grant to `health_dashboard_data.sql` for future creation or rebuilds. This is a repository-only correction: no SQL was run against the live database, and no live database permissions, data or configuration were changed. These explicit grants describe the minimum required access; they do not revoke broader server-role privileges already present on existing tables.

## Change procedure

1. Take a current database backup.
2. Review the SQL change separately from application code.
3. Apply it to a test project where practical.
4. Verify tables, policies, grants, functions and Cron jobs explicitly.
5. Apply to production, then run a read/write test as each permitted user without inspecting the other user's data.
6. Record the applied change and recovery route.

The current v0.83 release changes no database schema. Telegram snooze conflict protection is implemented in the Edge Function using the dashboard row's existing `updated_at` value.
