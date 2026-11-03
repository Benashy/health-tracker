# Telegram measurement entry

Status: v0.84 released on 3 November 2026 after Ben approved setup. Prepared and tested locally on 2 November. Entry remains off for each existing account until that person enables it. Release verification is recorded below; a genuine reading from Telegram remains the user acceptance test.

## Initial scope

- Weight in kg.
- Waist circumference in cm.
- Blood pressure as one systolic/diastolic pair in mmHg, saved atomically as the two existing metrics.

Each account must enable `Enter readings in Telegram` in its own Telegram settings after deployment. Existing linked accounts default to off. The setting is `settings.telegram.measurement_entry_enabled`, and only the boolean `true` enables entry. Pausing reminders does not turn off an explicitly enabled entry setting; disconnecting Telegram does.

## Intended flow

1. New reminders offer **Enter weight** and **Enter waist circumference** alongside Snooze when the relevant tracked measurements are due and Telegram entry is enabled. Blood pressure and VO2 max have no reminder entry buttons. The separate `/record` menu and shortcuts are unchanged.
2. The bot asks for the reading with Telegram's reply interface. Weight and waist accept decimal points or decimal commas. Pressure accepts a pair such as `120/80`.
3. The bot shows the reading, units and date. The default date is today in Europe/Lisbon, explicitly displayed in the confirmation. `Change date` accepts DD/MM/YYYY or YYYY-MM-DD, including historical dates but not future dates.
4. The user can change the value, change the date, cancel, or save. If a reading already exists on that day, the button explicitly offers to save another reading. Existing readings are not replaced.
5. Only after a successful cloud write does the bot confirm that the reading was saved. A used confirmation cannot create the reading again.

The dashboard's existing manual-refresh behaviour remains: the saved reading loads when the dashboard is opened or refreshed. An older open dashboard cannot overwrite Telegram changes without passing its existing cloud conflict check.

## Data handling

Readings are stored in the existing per-account `health_dashboard_data.data.measurements` array. They include the same dates, values, units, reference fields, target, source metadata, range status, previous result, change and trend fields used by manual entry. Existing targets and ranges are copied onto the new reading without changing historical reference snapshots. An unconfigured personal target is not invented. A stored unit mismatch requires dashboard review instead of automatic conversion.

The four supported numeric calculation paths are checked against the dashboard's existing calculation functions. Adding a backdated reading recalculates the affected metrics' changes while keeping original historical targets and ranges. Their existing Telegram snoozes are cleared just as they are after manual entry. Normal dashboard backups already include the resulting measurements.

## Access and retry controls

- The existing Telegram webhook secret must pass before any entry handling runs.
- Only a private chat whose sender ID matches the chat ID is accepted. Forwarded input and group chats are ignored.
- Exactly one account must be linked to that chat. The server verifies its current Supabase Auth user, confirmed approved email, ban status and expected profile before accepting entry.
- The account must explicitly enable entry, and the metric must still be tracked. The link version and profile must match throughout the conversation.
- Replies must target the latest prompt. Confirmation buttons contain a random session ID and revision, and must belong to the current confirmation message.
- Draft sessions expire after 15 minutes. Only one session exists per user; starting another replaces the old draft. Cancel and successful-save bookkeeping clear stored draft values immediately. An hourly cleanup removes expired session rows after 24 hours.
- Saving claims the session with a conditional revision update. Dashboard writes use the existing `updated_at` token and bounded retries. Stable measurement IDs prevent duplicate writes after a lost response or a second Save tap. Both blood-pressure records are one JSON update.
- Changes to relevant readings or reference settings require a fresh confirmation. Unrelated app edits are preserved when retrying a conflict.

Incoming readings and bot confirmations are health information in Telegram, which is why each account opts in. These are ordinary private bot chats, not Telegram Secret Chats or an end-to-end encrypted medical channel. Outgoing entry messages use `protect_content`; this is not protection against screenshots or access to an unlocked Telegram account.

Pending sessions are temporary state in the new server-only table `health_dashboard_telegram_entry_sessions`. Its SQL enables RLS, revokes `PUBLIC`, `anon` and `authenticated` access, and grants only the server role its required CRUD access. No browser RLS policy is created. This follows the explicit-grant rules introduced on 30 October. Session rows are intentionally excluded from independent health-data backups; saved health readings remain in the existing backed-up dashboard table.

## Source files

- `supabase/functions/health-tracker-telegram/measurement-model.mjs`: units, parsing, dates, reference snapshots and measurement calculations.
- `supabase/functions/health-tracker-telegram/measurement-entry.mjs`: guided conversation, draft lifecycle, confirmation and retry handling.
- `supabase/functions/health-tracker-telegram/index.ts`: existing authenticated webhook, Auth verification and Data API adapters.
- `supabase/telegram_measurement_entry.sql`: session table, explicit grants and expired-session cleanup job.
- `work/telegram-entry.test.mjs`: synthetic local tests, including webhook and database-adapter tests with all HTTP requests intercepted.
- `tests/telegram-entry.spec.js`: synthetic signed-in controls for both profiles on desktop and iPhone WebKit, including opt-in, opt-out and offline read-only behaviour.

## Verification completed locally

Run `pnpm run check` for application checks and Telegram entry tests, then `pnpm run test:browser` for desktop/iPhone smoke tests. Feature tests use synthetic accounts, mocked Telegram calls and mocked database requests. They must never fall through to a real HTTP service.

On 2 November 2026, the existing application function checks, all 29 Telegram entry tests and all eight Chromium/iPhone WebKit browser tests passed. Desktop and iPhone screenshots were also inspected. Tests covered interrupted saves and receipts, duplicate and concurrent taps, app conflicts, changed references, historical readings, cancelled/expired drafts, link changes and cross-account isolation. Browser emulation is not a real-device Telegram test.

A real Telegram conversation has not yet been tested. Do not invent or backfill test health readings for that purpose. The current function's custom webhook/scheduler authentication must be retained; changing gateway JWT settings is not part of this feature.

## Deployment Checklist

1. Review the local branch, confirm the approved scope and run the complete checks. Bump the frontend version and all cache markers for the release.
2. In a disposable Supabase project, install the existing canonical schema, then `telegram_measurement_entry.sql`. Its cleanup job depends on the existing Cron setup. Verify the session table has no browser access and explicit server-role access, with automatic grants disabled.
3. Use a separate test bot and synthetic accounts to exercise real private-chat entry, cancellation, a same-day reading, retry, loss of connectivity and both profiles. Include iPhone Telegram. Check saved records through the dashboard.
4. Check the approved production project's existing `service_role` SELECT/UPDATE access on `health_dashboard_data`. Do not rerun unrelated schema or permission changes just to deploy this feature.
5. When approved, apply the prepared session-table SQL to production. Deploy the Edge Function with `index.ts`, both new `.mjs` modules and `deno.json` in the same bundle. The existing webhook already subscribes to messages and callback queries; no BotFather change is required. The shortcuts work without changing the bot's command list.
6. Publish the versioned frontend only after the backend is ready. Keep entry off by default, then enable it for one account and record a real authorised reading. Confirm the value, date, references and previous-result fields in the app, and confirm another Save does not add a duplicate. Enable the other account only when ready.
7. Preserve a rollback reference. Reverting the frontend and Edge Function disables the new entry flow without deleting saved readings; do not restore or erase the dashboard database to roll back application code. The empty/expiring session table can remain until a separately approved cleanup.

The setup was approved on 3 November 2026. Entry must stay off by default, and changing either person's live health readings requires a genuine authorised measurement.

## Release Verification

- The new session table and expiry-cleanup job are installed. Browser roles have no access, RLS is enabled, and the server role has only SELECT/INSERT/UPDATE/DELETE. Default server privileges were explicitly revoked before granting these operations.
- A server-role insert/update/delete test and a stale-revision rejection test passed inside a rolled-back transaction; no session or health reading was left behind.
- The initial v0.84 backend was Edge Function version 18. All four deployed source files were read back and matched the release files exactly. Existing custom webhook/scheduler authentication and `verify_jwt=false` were retained.
- Live webhook status, a reminder dry run and an unknown-chat entry check returned HTTP 200. The dry run sent zero messages. Requests without scheduler/webhook credentials returned HTTP 401.
- The security advisor reports no new warning-level issue for this feature. Its information-only notice about a table having no RLS policies is intentional: browser access is revoked and only the server can use it. The existing leaked-password-protection recommendation remains on the separate security to-do list; Auth settings were not changed.
- Release commit: `a22ef85e834805d7db4dbf5bd2be27add0b1c296`. Both [GitHub quality checks](https://github.com/Benashy/health-tracker/actions/runs/41611854718) and [Pages deployment](https://github.com/Benashy/health-tracker/actions/runs/41611854043) succeeded.
- All 29 entry tests and eight local Chromium/iPhone WebKit checks passed again for the release. A further eight tests against the actual published v0.84 site passed, including the signed-out privacy checks and both profiles' synthetic opt-in/opt-out controls. The published iPhone screenshot was visually checked.
- Direct anonymous Data API requests to health data and entry sessions returned HTTP 401/permission denied. The before/after fingerprints and timestamps matched for both accounts. No user health records were created, edited or deleted; both entry opt-ins remained off.
- Remaining: each account's explicit opt-in and a genuine reading through that person's Telegram app. This is not a claim that real-device Telegram entry was tested. No paid test project or separate test bot was created.

The browser suite can also inspect the actual release without a local server:

```bash
HEALTH_TRACKER_TEST_BASE_URL=https://benashy.github.io/health-tracker/ pnpm run test:browser
```

Signed-in UI checks use synthetic accounts and intercepted storage, never real user sessions or database writes. They do not prove a real Telegram reading was saved.

Reminder-button follow-up, 3 November 2026: Edge Function version 19 is live. It changes only the reminder entry filter; the dashboard, metric due logic, Snooze, and separate command entry are unchanged. The 30-test suite passed, including a mixed scheduled reminder that retains Snooze and lists due blood pressure and VO2 max without adding entry buttons for either. The deployed bundle matched the tested files, and the live scheduler dry run sent zero messages.

Rollback reference: the previous backend was Edge Function version 17, with `index.ts` importing `https://raw.githubusercontent.com/Benashy/health-tracker/79613773491402e41a52e2458917f547bcb300ac/supabase/functions/health-tracker-telegram/index.ts`. Preserve the existing `deno.json` and explicitly set `import_map_path` to `deno.json` when restoring this wrapper. Omitting the import-map path can retain an invalid path from the previous deployment.

## References

- Telegram Bot API: https://core.telegram.org/bots/api#forcereply
- Telegram callback queries: https://core.telegram.org/bots/api#callbackquery
- Supabase Auth admin user lookup: https://supabase.com/docs/reference/javascript/auth-admin-getuserbyid
- Supabase explicit-grant notice: https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically
