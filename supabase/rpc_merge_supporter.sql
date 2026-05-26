-- RPC: merge supporter profile atomically server-side
-- Uses auth.uid() as the authoritative user_id

create or replace function public.rpc_merge_supporter_profile(
  p_supporter_total integer,
  p_unlocked_rewards jsonb default '[]'::jsonb,
  p_unlocked_badges jsonb default '[]'::jsonb
)
returns table(merged_total integer, merged_unlocked jsonb, merged_badges jsonb) as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  with upsert as (
    insert into public.supporter_profiles (user_id, supporter_total, unlocked_rewards, unlocked_badges, last_write, updated_at)
    values (
      auth.uid()::uuid,
      coalesce(p_supporter_total, 0),
      coalesce(p_unlocked_rewards, '[]'::jsonb),
      coalesce(p_unlocked_badges, '[]'::jsonb),
      now(),
      now()
    )
    on conflict (user_id) do update
    set
      supporter_total = greatest(coalesce(public.supporter_profiles.supporter_total, 0), coalesce(excluded.supporter_total, 0)),
      unlocked_rewards = (
        select coalesce(jsonb_agg(distinct x), '[]'::jsonb) from (
          select jsonb_array_elements_text(coalesce(public.supporter_profiles.unlocked_rewards, '[]'::jsonb)) as x
          union
          select jsonb_array_elements_text(coalesce(excluded.unlocked_rewards, '[]'::jsonb)) as x
        ) s
      ),
      unlocked_badges = (
        select coalesce(jsonb_agg(distinct x), '[]'::jsonb) from (
          select jsonb_array_elements_text(coalesce(public.supporter_profiles.unlocked_badges, '[]'::jsonb)) as x
          union
          select jsonb_array_elements_text(coalesce(excluded.unlocked_badges, '[]'::jsonb)) as x
        ) s
      ),
      sync_version = coalesce(public.supporter_profiles.sync_version, 1) + 1,
      last_write = now(),
      updated_at = now()
    returning supporter_total, unlocked_rewards, unlocked_badges
  )
  select supporter_total, unlocked_rewards, unlocked_badges from upsert;

end;
$$ language plpgsql security definer;

-- Grant execute to authenticated role (clients)
grant execute on function public.rpc_merge_supporter_profile(integer, jsonb, jsonb) to authenticated;

-- Optional: revoke execute from anon if you want stricter control
-- revoke execute on function public.rpc_merge_supporter_profile(integer, jsonb, jsonb) from anon;
