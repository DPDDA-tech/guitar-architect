-- Supabase Data API explicit grants migration (safe/idempotent)
-- Handles environments where some tables/functions may not exist yet.

begin;

grant usage on schema public to anon, authenticated, service_role;

-- ga_user_snapshots
do $$
begin
  if to_regclass('public.ga_user_snapshots') is not null then
    execute 'revoke all on table public.ga_user_snapshots from anon, authenticated';
    execute 'grant select, insert, update on table public.ga_user_snapshots to authenticated';
  end if;
end $$;

-- supporter_profiles
do $$
begin
  if to_regclass('public.supporter_profiles') is not null then
    execute 'revoke all on table public.supporter_profiles from anon, authenticated';
    execute 'grant select, insert, update on table public.supporter_profiles to authenticated';
  end if;
end $$;

-- reward_grants + optional RLS hardening (only if table exists)
do $$
begin
  if to_regclass('public.reward_grants') is not null then
    execute 'revoke all on table public.reward_grants from anon, authenticated';
    execute 'grant select, insert, update on table public.reward_grants to authenticated';
    execute 'alter table public.reward_grants enable row level security';

    execute 'drop policy if exists "Authenticated can read reward grants" on public.reward_grants';
    execute 'drop policy if exists "Authenticated can insert reward grants" on public.reward_grants';
    execute 'drop policy if exists "Authenticated can update reward grants" on public.reward_grants';

    execute $policy$
      create policy "Authenticated can read own active reward grants"
        on public.reward_grants
        for select
        to authenticated
        using (
          revoked_at is null
          and lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
        )
    $policy$;

    execute $policy$
      create policy "Authenticated can insert own reward grants"
        on public.reward_grants
        for insert
        to authenticated
        with check (
          lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
        )
    $policy$;

    execute $policy$
      create policy "Authenticated can update own reward grants"
        on public.reward_grants
        for update
        to authenticated
        using (
          lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
        )
        with check (
          lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
        )
    $policy$;
  end if;
end $$;

-- rpc_merge_supporter_profile signature-specific grants, only if function exists
do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rpc_merge_supporter_profile'
      and pg_get_function_identity_arguments(p.oid) = 'integer, jsonb, jsonb'
  ) then
    execute 'grant execute on function public.rpc_merge_supporter_profile(integer, jsonb, jsonb) to authenticated';
    execute 'revoke execute on function public.rpc_merge_supporter_profile(integer, jsonb, jsonb) from anon';
  end if;
end $$;

-- Future-proof defaults for new tables created by role postgres
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke all on tables from authenticated;

commit;

