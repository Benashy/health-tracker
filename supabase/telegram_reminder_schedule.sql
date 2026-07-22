create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

create table if not exists public.health_dashboard_telegram_reminder_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_sent_date date,
  last_signature text,
  last_sent_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.health_dashboard_telegram_reminder_state enable row level security;

revoke all privileges on table public.health_dashboard_telegram_reminder_state from anon;
revoke all privileges on table public.health_dashboard_telegram_reminder_state from authenticated;
grant select, insert, update on table public.health_dashboard_telegram_reminder_state to service_role;

create table if not exists public.health_dashboard_telegram_pairing_codes (
  code text primary key,
  chat_id text not null,
  chat_label text,
  chat_username text,
  received_at timestamptz not null default now(),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists health_dashboard_telegram_pairing_codes_expires_at_idx
on public.health_dashboard_telegram_pairing_codes (expires_at);

alter table public.health_dashboard_telegram_pairing_codes enable row level security;

revoke all privileges on table public.health_dashboard_telegram_pairing_codes from anon;
revoke all privileges on table public.health_dashboard_telegram_pairing_codes from authenticated;
grant select, insert, update, delete on table public.health_dashboard_telegram_pairing_codes to service_role;

do $$
declare
  secret_value text;
begin
  select decrypted_secret
    into secret_value
  from vault.decrypted_secrets
  where name = 'health_tracker_telegram_cron_secret'
  limit 1;

  if secret_value is null then
    secret_value := encode(extensions.gen_random_bytes(32), 'hex');
    perform vault.create_secret(secret_value, 'health_tracker_telegram_cron_secret');
  end if;
end $$;

do $$
declare
  secret_value text;
begin
  select decrypted_secret
    into secret_value
  from vault.decrypted_secrets
  where name = 'health_tracker_telegram_webhook_secret'
  limit 1;

  if secret_value is null then
    secret_value := encode(extensions.gen_random_bytes(32), 'hex');
    perform vault.create_secret(secret_value, 'health_tracker_telegram_webhook_secret');
  end if;
end $$;

create or replace function public.health_tracker_cron_secret_matches(provided_secret text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from vault.decrypted_secrets
    where name = 'health_tracker_telegram_cron_secret'
      and decrypted_secret = provided_secret
  );
$$;

revoke all on function public.health_tracker_cron_secret_matches(text) from public;
revoke all on function public.health_tracker_cron_secret_matches(text) from anon;
revoke all on function public.health_tracker_cron_secret_matches(text) from authenticated;
grant execute on function public.health_tracker_cron_secret_matches(text) to service_role;

create or replace function public.health_tracker_telegram_webhook_secret_matches(provided_secret text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from vault.decrypted_secrets
    where name = 'health_tracker_telegram_webhook_secret'
      and decrypted_secret = provided_secret
  );
$$;

revoke all on function public.health_tracker_telegram_webhook_secret_matches(text) from public;
revoke all on function public.health_tracker_telegram_webhook_secret_matches(text) from anon;
revoke all on function public.health_tracker_telegram_webhook_secret_matches(text) from authenticated;
grant execute on function public.health_tracker_telegram_webhook_secret_matches(text) to service_role;

create or replace function public.health_tracker_telegram_webhook_secret()
returns text
language sql
security definer
set search_path = ''
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = 'health_tracker_telegram_webhook_secret'
  limit 1;
$$;

revoke all on function public.health_tracker_telegram_webhook_secret() from public;
revoke all on function public.health_tracker_telegram_webhook_secret() from anon;
revoke all on function public.health_tracker_telegram_webhook_secret() from authenticated;
grant execute on function public.health_tracker_telegram_webhook_secret() to service_role;

do $$
begin
  perform cron.unschedule('health-tracker-telegram-reminders');
exception
  when others then
    null;
end $$;

select cron.schedule(
  'health-tracker-telegram-reminders',
  '0 8,9 * * *',
  $$
    select net.http_post(
      url := 'https://anvuatpwdcmzxywtajlq.supabase.co/functions/v1/health-tracker-telegram',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-health-tracker-cron-secret',
        (select decrypted_secret from vault.decrypted_secrets where name = 'health_tracker_telegram_cron_secret')
      ),
      body := jsonb_build_object('action', 'send_scheduled_reminders'),
      timeout_milliseconds := 15000
    ) as request_id;
  $$
);
