-- Migration: supporter_profiles
-- Supporter profiles: totals, unlocked rewards and badges (server-authoritative)

create table if not exists public.supporter_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  supporter_total integer default 0,
  unlocked_rewards jsonb default '[]',
  unlocked_badges jsonb default '[]',
  sync_version integer default 1,
  last_write timestamptz default now(),
  updated_at timestamptz not null default now()
);

alter table public.supporter_profiles enable row level security;

create policy "Users can read their own supporter profile"
  on public.supporter_profiles
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own supporter profile"
  on public.supporter_profiles
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own supporter profile"
  on public.supporter_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
