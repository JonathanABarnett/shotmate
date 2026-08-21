-- ShotMate backend: one snapshot per user (sync) + push subscriptions (reminders).
create extension if not exists pg_cron;
create extension if not exists pg_net;

create table public.snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.snapshots enable row level security;
create policy "own snapshot" on public.snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  tz_offset_min int not null default 0,
  schedule_days int not null default 7,
  next_due timestamptz,
  dose_mg numeric,
  med_name text,
  notified_eve_due timestamptz,
  notified_day_due timestamptz,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
create policy "own subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Service-role-only settings (VAPID keys). RLS on with no policies = clients can't read it.
create table public.app_config (
  key text primary key,
  value text not null
);
alter table public.app_config enable row level security;
