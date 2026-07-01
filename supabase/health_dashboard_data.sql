create table if not exists public.health_dashboard_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.health_dashboard_data enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update on public.health_dashboard_data to authenticated;

drop policy if exists "Users can read their own health dashboard data" on public.health_dashboard_data;
create policy "Users can read their own health dashboard data"
on public.health_dashboard_data
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own health dashboard data" on public.health_dashboard_data;
create policy "Users can insert their own health dashboard data"
on public.health_dashboard_data
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own health dashboard data" on public.health_dashboard_data;
create policy "Users can update their own health dashboard data"
on public.health_dashboard_data
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
