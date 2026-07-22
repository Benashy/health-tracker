# Telegram Integration Handover

Project: Health Tracker
Live app: https://benashy.github.io/health-tracker/
Supabase project ref: anvuatpwdcmzxywtajlq
Bot username: HealthTrackerReminderBot

## Purpose

Health Tracker uses Telegram for private reminder messages when checks are due or due soon. The reminders are intentionally low-noise: one scheduled reminder per user per day maximum, grouped by check cycle where possible, with snooze buttons.

This pattern is intended to be reusable across Ben's other personal apps, ideally with one separate Telegram bot per project and shared underlying reminder logic.

## Where Things Are Stored

### Telegram Bot Token

The Telegram bot token is stored server-side only as a Supabase Edge Function secret:

`HEALTH_TRACKER_TELEGRAM_BOT_TOKEN`

It is used inside:

`supabase/functions/health-tracker-telegram/index.ts`

It must never be committed to GitHub, placed in browser JavaScript, or exposed in the frontend.

### Telegram Chat ID

Each user's linked Telegram chat ID is stored inside that user's private dashboard JSON row:

Table:

`public.health_dashboard_data`

Column:

`data jsonb`

Path inside the JSON:

```json
{
  "settings": {
    "telegram": {
      "chat_id": "123456789",
      "chat_label": "Telegram chat name",
      "linked_at": "ISO timestamp",
      "test_sent_at": "ISO timestamp",
      "due_test_sent_at": "ISO timestamp",
      "enabled": true,
      "paused_at": "",
      "snoozes": {}
    }
  }
}
```

The chat ID is not public. It is only available after the signed-in user loads their own Supabase row under RLS.

### Temporary Pairing Codes

Pairing codes are stored server-side in:

`public.health_dashboard_telegram_pairing_codes`

This table stores temporary codes such as `HT-ABC123` alongside the Telegram chat ID that sent the code. Codes expire after 30 minutes.

The table is locked down:

- RLS enabled.
- No anon access.
- No authenticated-user access.
- Service role only.

### Daily Reminder State

Daily reminder bookkeeping is stored in:

`public.health_dashboard_telegram_reminder_state`

This prevents duplicate daily reminders without updating the user's main dashboard JSON every morning.

It stores:

- `user_id`
- `last_sent_date`
- `last_signature`
- `last_sent_at`
- `updated_at`

This table is also service-role only.

## Supabase SQL

The SQL lives in:

`supabase/telegram_reminder_schedule.sql`

It creates:

- `pgcrypto`
- `pg_net`
- `pg_cron`
- `health_dashboard_telegram_reminder_state`
- `health_dashboard_telegram_pairing_codes`
- Vault-backed cron secret
- Vault-backed Telegram webhook secret
- RPC helper: `health_tracker_cron_secret_matches(provided_secret text)`
- RPC helper: `health_tracker_telegram_webhook_secret_matches(provided_secret text)`
- RPC helper: `health_tracker_telegram_webhook_secret()`
- Cron job: `health-tracker-telegram-reminders`

The cron schedule is:

```sql
'0 8,9 * * *'
```

Supabase cron is UTC-based, so the job tries both 08:00 and 09:00 UTC. The Edge Function then checks the local `Europe/Lisbon` hour and only sends when local time is 09:00. This handles seasonal time changes more safely.

## Edge Function

Function name:

`health-tracker-telegram`

Source:

`supabase/functions/health-tracker-telegram/index.ts`

Live URL:

`https://anvuatpwdcmzxywtajlq.supabase.co/functions/v1/health-tracker-telegram`

The function was deployed with:

`verify_jwt: false`

This is intentional because it must also receive Telegram webhooks and cron calls. Security is handled inside the function:

- Normal dashboard actions require a valid Supabase user session and approved email.
- Scheduler actions require the private `x-health-tracker-cron-secret` header.
- Telegram webhooks require the private `x-telegram-bot-api-secret-token` header.
- Approved emails are restricted to Ben and Angelika.

## Function Actions

The function handles:

### `probe`

Checks bot connection using Telegram `getMe`.

Requires signed-in approved user.

### `resolve_chat`

Used during pairing.

Frontend generates a code, user sends it to the bot, webhook stores it, and this action checks whether the code has been received.

Requires signed-in approved user.

### `send_test`

Sends a simple connection test message:

```text
Health Tracker reminders are connected.
```

Requires signed-in approved user.

### `send_due_summary`

Manual test from the dashboard.

Sends the current due summary, including snooze buttons if checks are due.

Requires signed-in approved user.

### `send_scheduled_reminders`

Called by Supabase cron.

Requires private cron secret.

Runs at 09:00 local time, checks all dashboard rows, and sends at most one reminder per user per day.

### `configure_webhook`

Configures the Telegram webhook using `setWebhook`.

Requires private cron secret.

### `webhook_status`

Checks Telegram webhook status.

Requires private cron secret.

### Telegram webhook payload

Telegram sends message and callback updates directly to the same Edge Function URL. These are accepted only when the Telegram webhook secret header matches the Vault secret.

## Pairing Flow

1. User signs into the dashboard.
2. User opens the Telegram panel from the top menu.
3. User clicks `Pair Telegram`.
4. Frontend generates a short code, e.g. `HT-ABC123`.
5. User opens `https://t.me/HealthTrackerReminderBot`.
6. User sends the code to the bot.
7. Telegram webhook posts the message to the Supabase Edge Function.
8. Edge Function extracts the code and stores the chat ID in `health_dashboard_telegram_pairing_codes`.
9. User clicks `Check code` in the dashboard.
10. Dashboard calls `resolve_chat`.
11. Edge Function returns the chat ID.
12. Dashboard saves the chat ID in the user's private JSON row.
13. User can press `Send test`.

This replaced an earlier polling approach using Telegram `getUpdates`.

## Reminder Message Format

When something is due:

```text
Health Tracker reminder

Some Health Tracker checks are due soon.

- Body composition (14-day cycle): Weight, Waist circumference
- Vitals and fitness (30-day cycle): Blood pressure systolic, Blood pressure diastolic

Open dashboard: https://benashy.github.io/health-tracker/
```

When nothing is due:

```text
Health Tracker reminder

No priority checks are due right now.
```

No health values are included in Telegram reminders.

## Snooze Buttons

Reminder messages can include inline Telegram buttons:

- `Snooze all 3d`
- `Snooze all 7d`
- Group-specific next-cycle buttons, for example:
  - `Body composition: next 14d`
  - `Vitals and fitness: next 30d`
  - `Six-monthly bloods: next 6m`
  - `Eye test: next 2y`

Telegram callback data uses a short prefix:

`hts`

Examples:

```text
hts:all:3
hts:all:7
hts:g:body
hts:g:six-month-bloods
```

When a snooze button is tapped, the Edge Function updates `data.schedule_state.snoozes` inside the user's dashboard JSON.

## Reminder Grouping

Checks are grouped before sending so the user does not receive a separate message for every metric.

Current Health Tracker groups:

- Body composition, 14-day cycle.
- Vitals and fitness, 30-day cycle.
- Fitness, 3-month cycle.
- Six-monthly bloods, 6-month cycle.
- Annual bloods and urine, 12-month cycle.
- Pilot medical, 12-month annual CAA cycle.
- Eye test, 2-year cycle.
- Dermatology, 12-month cycle.
- Infrequent checks, 5-10 year cycle.

## Special Health Tracker Reminder Rules

Most metrics follow the normal due-soon rules:

- 14-day metrics: amber/due soon within 2 days.
- 30-day metrics: within 3 days.
- 3-month metrics: within 7 days.
- 6-month metrics: within 14 days.
- Annual metrics: within 30 days.
- Multi-year metrics: within 90 days.

Ben's pilot medical has custom milestones:

- Due/expiry date: 14 July 2027.
- Repeat annually.
- Dashboard warning begins 42 days before.
- Telegram scheduled reminders only at:
  - 42 days before
  - 30 days before
  - 14 days before
  - 7 days before
  - 1 day before
  - 1 day after expiry

This avoids sending daily Telegram reminders for the whole six-week warning window.

## Frontend UI

Relevant constants/functions are in:

`app.js`

Key names:

- `TELEGRAM_FUNCTION_NAME`
- `TELEGRAM_BOT_USERNAME`
- `TELEGRAM_REMINDER_GROUPS`
- `normaliseTelegramSettings`
- `openTelegramPanel`
- `closeTelegramPanel`
- `startTelegramPairing`
- `checkTelegramPairingCode`
- `sendTelegramTestMessage`
- `sendTelegramDueTestMessage`
- `toggleTelegramReminders`
- `disconnectTelegramReminders`

The Telegram panel should only open when selected by the user. It should not open automatically on login or refresh.

The panel should not be visible before authentication.

## Deployment Notes

The full function source is committed in GitHub:

`supabase/functions/health-tracker-telegram/index.ts`

On this machine, the normal Supabase CLI was not available. The Supabase connector was used instead.

The deployed function is currently a small pinned entrypoint that imports the full source from the exact GitHub commit:

```ts
import "https://raw.githubusercontent.com/Benashy/health-tracker/f85a62761f7540cda2eb39734c4cf2bccb31dff5/supabase/functions/health-tracker-telegram/index.ts";
```

This avoided having to paste a large 40 KB Edge Function body through the connector.

For future projects, the cleaner long-term option is:

- Install/use Supabase CLI; or
- Add a GitHub Action to deploy Supabase Edge Functions; or
- Use the same pinned-import wrapper only as a practical fallback.

Important deployment detail:

When deploying through the Supabase connector, explicitly set:

`import_map_path: "deno.json"`

Otherwise the connector may try to reuse an old generated import-map path and fail with:

```text
import map path does not exist
```

## Issues Faced And Fixes

### Issue: Bot did not react to pasted pairing code

Cause:

The original approach relied on polling Telegram updates, which is brittle once webhooks and inline callback buttons are involved.

Fix:

Switch to webhook-captured pairing codes. Telegram sends messages to the Edge Function, the function stores temporary pairing codes, and the dashboard checks for the code.

### Issue: Need both browser calls and Telegram/cron calls

Cause:

Dashboard calls need user authentication, but Telegram webhooks and cron calls cannot use a user's Supabase JWT.

Fix:

Deploy Edge Function with `verify_jwt: false`, then perform custom checks inside the function:

- Supabase user auth for dashboard actions.
- Cron secret for scheduled actions.
- Telegram webhook secret for webhook actions.

### Issue: Scheduled reminders could spam or duplicate

Cause:

Cron may run more than once, and multiple metrics may be due at once.

Fix:

- One scheduled reminder per user per day.
- Store daily send state in `health_dashboard_telegram_reminder_state`.
- Group due items by cycle/category.
- Use milestone-only reminders for special checks such as pilot medical.

### Issue: Updating the main dashboard JSON during scheduled reminders could cause cloud conflicts

Cause:

The dashboard uses one JSON blob per user with conflict protection. A scheduled backend write could create conflicts with a user editing from another device.

Fix:

Daily send bookkeeping lives in a separate server-side table. The main dashboard JSON is only updated for user-initiated changes, such as pressing a Telegram snooze button.

### Issue: Time zone and daylight saving

Cause:

Supabase cron is UTC-based, but the user wants 09:00 UK/Lisbon time.

Fix:

Cron runs at both 08:00 and 09:00 UTC. The Edge Function checks `Europe/Lisbon` local time and sends only when local hour is 09.

### Issue: Telegram modal opened automatically

Cause:

The UI state was too eager and opened the Telegram panel on login/refresh.

Fix:

Use a dedicated `telegramPanelOpen` state flag. Keep it false by default. Only set true when the user clicks the Telegram menu item.

### Issue: Supabase connector deploy failed with import map path error

Cause:

The connector attempted to reuse a generated file path from the previous Edge Function version.

Fix:

Deploy with an explicit `import_map_path: "deno.json"`.

## Recommended Setup For The Next Project

Use one Telegram bot per project, but reuse the same broad architecture:

1. Create a project-specific bot in BotFather.
2. Store the token as a Supabase Edge Function secret.
3. Create a project-specific Edge Function.
4. Store each user's Telegram chat ID in their own private app data row.
5. Use a temporary pairing-code table.
6. Use a webhook, not polling.
7. Use a private cron secret and pg_cron for scheduled reminders.
8. Keep daily send bookkeeping in a separate table.
9. Keep reminders grouped and low-noise.
10. Include snooze buttons.
11. Never include sensitive values in Telegram reminders unless deliberately approved.
12. Keep Telegram setup hidden until the user is signed in.

## BotFather Notes

For Health Tracker:

- Bot display name: Health Tracker Bot
- Username: HealthTrackerReminderBot

Recommended for other projects:

- Use a project-specific bot name.
- Avoid including personal names.
- Use a clear reminder-oriented name.
- Keep each project in a separate Telegram chat so reminders do not mix.

## Security Principles

- Bot token stays in Supabase secrets only.
- Chat ID stays in private per-user cloud data only.
- Pairing-code table is service-role only.
- Reminder-state table is service-role only.
- Scheduled endpoint requires cron secret.
- Webhook endpoint requires Telegram webhook secret.
- Dashboard actions require signed-in approved users.
- Public GitHub repo must not contain secrets.
- Telegram reminders should avoid health values unless there is a deliberate reason to include them.

