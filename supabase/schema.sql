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

-- Security hardening:
-- If Supabase or a previous helper created public.rls_auto_enable() as a
-- SECURITY DEFINER function, it must not be executable by client roles.
-- This block is intentionally signature-agnostic, so it also works if the
-- function has arguments.
do $$
declare
  fn regprocedure;
begin
  for fn in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rls_auto_enable'
  loop
    execute format('revoke execute on function %s from public', fn);
    execute format('revoke execute on function %s from anon', fn);
    execute format('revoke execute on function %s from authenticated', fn);
  end loop;
end $$;

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
