-- Server-only temporary state for guided Telegram measurements (v0.84).
create table if not exists public.health_dashboard_telegram_entry_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  session_id uuid not null unique,
  revision integer not null check (revision >= 0),
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint telegram_entry_stage check (
    state ? 'stage' and state ->> 'stage' is not null
    and state ->> 'stage' in ('awaiting_value', 'awaiting_date', 'confirming', 'saving', 'saved', 'cancelled')
  )
);

alter table public.health_dashboard_telegram_entry_sessions enable row level security;
revoke all privileges on table public.health_dashboard_telegram_entry_sessions from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.health_dashboard_telegram_entry_sessions to service_role;

create index if not exists health_dashboard_telegram_entry_sessions_expiry_idx
on public.health_dashboard_telegram_entry_sessions (expires_at);

-- Terminal sessions clear their values immediately; abandoned drafts expire after 15 minutes.
-- Remove expired session metadata and abandoned values within the following day.
select cron.schedule(
  'health-tracker-telegram-entry-cleanup',
  '17 * * * *',
  $$delete from public.health_dashboard_telegram_entry_sessions where expires_at < now() - interval '24 hours';$$
);
