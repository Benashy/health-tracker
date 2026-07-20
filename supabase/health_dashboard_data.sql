create table if not exists public.health_dashboard_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.health_dashboard_data enable row level security;

revoke all privileges on table public.health_dashboard_data from anon;
revoke delete, truncate, references, trigger on table public.health_dashboard_data from authenticated;

grant usage on schema public to authenticated;
grant select, insert, update on public.health_dashboard_data to authenticated;

drop policy if exists "Approved users can read their own health dashboard data" on public.health_dashboard_data;
drop policy if exists "Approved users can insert their own health dashboard data" on public.health_dashboard_data;
drop policy if exists "Approved users can update their own health dashboard data" on public.health_dashboard_data;

drop policy if exists "Users can read their own health dashboard data" on public.health_dashboard_data;
create policy "Approved users can read their own health dashboard data"
on public.health_dashboard_data
for select
to authenticated
using (
  ((select auth.uid()) = user_id)
  and lower(coalesce(((select auth.jwt()) ->> 'email'), '')) = any (
    array['ben_ashurst@me.com', 'angelika_kleczka@hotmail.com']
  )
);

drop policy if exists "Users can insert their own health dashboard data" on public.health_dashboard_data;
create policy "Approved users can insert their own health dashboard data"
on public.health_dashboard_data
for insert
to authenticated
with check (
  ((select auth.uid()) = user_id)
  and lower(coalesce(((select auth.jwt()) ->> 'email'), '')) = any (
    array['ben_ashurst@me.com', 'angelika_kleczka@hotmail.com']
  )
);

drop policy if exists "Users can update their own health dashboard data" on public.health_dashboard_data;
create policy "Approved users can update their own health dashboard data"
on public.health_dashboard_data
for update
to authenticated
using (
  ((select auth.uid()) = user_id)
  and lower(coalesce(((select auth.jwt()) ->> 'email'), '')) = any (
    array['ben_ashurst@me.com', 'angelika_kleczka@hotmail.com']
  )
)
with check (
  ((select auth.uid()) = user_id)
  and lower(coalesce(((select auth.jwt()) ->> 'email'), '')) = any (
    array['ben_ashurst@me.com', 'angelika_kleczka@hotmail.com']
  )
);
