-- Guitar Architect cloud sync foundation.
-- Apply this SQL in Supabase when you are ready to enable remote sync.
-- The frontend falls back to localStorage/JSON when this table does not exist.

create table if not exists public.ga_user_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ga_user_snapshots enable row level security;

create policy "Users can read their own Guitar Architect snapshot"
  on public.ga_user_snapshots
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own Guitar Architect snapshot"
  on public.ga_user_snapshots
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own Guitar Architect snapshot"
  on public.ga_user_snapshots
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Future protected logo/reward asset strategy:
-- 1. Keep unreleased or locked logos out of /public.
-- 2. Store official locked assets in a private Supabase Storage bucket.
-- 3. Expose only placeholders/silhouettes publicly.
-- 4. Generate signed URLs only after the corresponding achievement/reward is unlocked.
--
-- Example bucket name:
--   ga-reward-assets
--
-- Do not make this bucket public if the goal is real protection.
