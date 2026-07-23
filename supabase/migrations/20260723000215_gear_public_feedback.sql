-- Gear public consultation: safe persistence for "Opinar sobre este conceito".
--
-- SECURITY MODEL (write path):
-- * authenticated (including Supabase Anonymous Sign-In users, who hold a
--   real JWT with role "authenticated" and is_anonymous = true) gets ONLY a
--   SELECT policy restricted to auth.uid() = user_id.
-- * There is intentionally NO insert/update/delete policy for anon or
--   authenticated on this table, and no table-level insert/update/delete
--   grant either. This is deliberate, not an oversight: if a client policy
--   allowed `auth.uid() = user_id` writes, a browser could call
--   supabase.from('gear_public_feedback').upsert(...) directly and
--   completely bypass Cloudflare Turnstile, the persistent rate limit, the
--   product/option allowlist and the payload normalization that all live in
--   the submit-gear-feedback Edge Function. The unique(product_id, user_id)
--   constraint does NOT close that hole — it only stops duplicate rows, not
--   an unverified, unlimited, unvalidated write.
-- * The ONLY way to create or update a row is the submit-gear-feedback Edge
--   Function, which authenticates the caller from their JWT, runs every
--   server-side check, and then writes using the service_role key (which
--   bypasses RLS entirely, by Postgres/PostgREST design — service_role is
--   not subject to policies).
-- * risk_status is additionally never trusted from the client even in that
--   write path: a BEFORE INSERT/UPDATE trigger forces it back to its safe
--   value unless the request is running as service_role. This trigger is
--   defense-in-depth on top of the missing write policies above. It is not a substitute for them, and must not be treated as "the" protection.
--   No moderation/admin logic is implemented in this round — risk_status
--   simply stays at its 'accepted' default for every row created here.
-- * The same trigger also maintains updated_at, since the project does not
--   yet have a shared generic "touch updated_at" trigger function to reuse.
-- * Rate limiting is persisted in gear_feedback_rate_limits, a table with NO
--   grants to anon/authenticated at all — only the service_role (used by the
--   Edge Function) can read or write it, via the
--   gear_feedback_check_rate_limit() RPC below.

begin;

-- ---------------------------------------------------------------------------
-- 1. Public consultation responses
-- ---------------------------------------------------------------------------

create table if not exists public.gear_public_feedback (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  interest text not null,
  use_contexts text[] not null,
  other_use_context text null,
  priority text not null,
  comment text null,
  wants_updates boolean not null default false,
  email text null,
  risk_status text not null default 'accepted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint gear_public_feedback_product_id_check check (
    product_id in (
      'blueprint-journal',
      'desk-mat-studio',
      'cleaning-kit',
      'premium-cap',
      'pedalboard-dust-cover',
      'pedalboard-soft-case',
      'modular-organizer-case',
      'maintenance-kit',
      'mug',
      'picks',
      'pick-tin',
      'headphone-stand',
      'pedalboard-mat',
      'thermal-line',
      'guitar-premium-bag'
    )
  ),
  constraint gear_public_feedback_interest_check check (
    interest in ('high', 'medium', 'low', 'none')
  ),
  constraint gear_public_feedback_risk_status_check check (
    risk_status in ('accepted', 'review', 'blocked')
  ),
  constraint gear_public_feedback_priority_check check (
    priority in (
      'quality',
      'functionality',
      'durability',
      'design',
      'portability',
      'organization',
      'affordable-price',
      'other'
    )
  ),
  constraint gear_public_feedback_use_contexts_not_empty check (
    array_length(use_contexts, 1) is not null and array_length(use_contexts, 1) >= 1
  ),
  constraint gear_public_feedback_use_contexts_size check (
    array_length(use_contexts, 1) <= 9
  ),
  constraint gear_public_feedback_use_contexts_allowed check (
    use_contexts <@ array[
      'home-study', 'lessons', 'rehearsals', 'studio', 'performances',
      'transport', 'organization', 'daily-use', 'other'
    ]::text[]
  ),
  constraint gear_public_feedback_comment_length check (
    comment is null or char_length(comment) <= 1000
  ),
  constraint gear_public_feedback_other_use_context_length check (
    other_use_context is null or char_length(other_use_context) <= 140
  ),
  constraint gear_public_feedback_email_length check (
    email is null or char_length(email) <= 254
  ),

  constraint gear_public_feedback_unique_product_per_user unique (product_id, user_id)
);

comment on table public.gear_public_feedback is 'One active public-consultation response per (product_id, user_id). Updated in place on re-submission.';
comment on column public.gear_public_feedback.risk_status is 'Server-controlled only. Never writable by anon/authenticated clients — see gear_feedback_protect_risk_status trigger.';

create index if not exists idx_gear_public_feedback_product_id on public.gear_public_feedback(product_id);
create index if not exists idx_gear_public_feedback_user_id on public.gear_public_feedback(user_id);
create index if not exists idx_gear_public_feedback_created_at on public.gear_public_feedback(created_at);
create index if not exists idx_gear_public_feedback_risk_status on public.gear_public_feedback(risk_status);

-- ---------------------------------------------------------------------------
-- 2. updated_at + risk_status protection trigger
-- ---------------------------------------------------------------------------

create or replace function public.gear_feedback_protect_risk_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() is distinct from 'service_role' then
    if tg_op = 'INSERT' then
      new.risk_status := 'accepted';
    elsif tg_op = 'UPDATE' then
      new.risk_status := old.risk_status;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists gear_feedback_protect_risk_status on public.gear_public_feedback;
create trigger gear_feedback_protect_risk_status
  before insert or update on public.gear_public_feedback
  for each row execute function public.gear_feedback_protect_risk_status();

-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------

alter table public.gear_public_feedback enable row level security;

-- Drop any previous insert/update policies from earlier rounds of this
-- migration file. Re-running this migration must not leave a write hole
-- behind — this table has read-only access for anon/authenticated, full
-- stop.
drop policy if exists "Users can insert their own gear feedback" on public.gear_public_feedback;
drop policy if exists "Users can update their own gear feedback" on public.gear_public_feedback;

drop policy if exists "Users can read their own gear feedback" on public.gear_public_feedback;
create policy "Users can read their own gear feedback"
  on public.gear_public_feedback
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Intentionally no insert/update/delete policy for anon or authenticated:
-- RLS denies any operation without a matching policy, so direct writes from
-- the browser are blocked regardless of what the table-level grants say.
-- Intentionally no public/aggregate read policy in this round.

revoke all on table public.gear_public_feedback from anon, authenticated;
-- Read-only for clients. No insert/update/delete grant to anon/authenticated
-- — even if a future edit accidentally added a permissive policy, the
-- absence of these grants would still block the write at the privilege
-- level. service_role is not listed here because it bypasses grants and RLS
-- entirely by default in Postgres/PostgREST.
grant select on table public.gear_public_feedback to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Rate limiting (persistent, service_role-only)
-- ---------------------------------------------------------------------------

create table if not exists public.gear_feedback_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  window_kind text not null check (window_kind in ('minute', 'hour')),
  window_start timestamptz not null,
  attempt_count integer not null default 0,
  ip_hash text null,
  updated_at timestamptz not null default now(),
  primary key (user_id, window_kind, window_start)
);

comment on table public.gear_feedback_rate_limits is 'Server-side only. No grants to anon/authenticated — touched exclusively via gear_feedback_check_rate_limit(), called by the submit-gear-feedback Edge Function with the service_role key.';
comment on column public.gear_feedback_rate_limits.ip_hash is 'HMAC-SHA256 of the caller IP using RATE_LIMIT_IP_SALT. Raw IP addresses are never stored.';

alter table public.gear_feedback_rate_limits enable row level security;
-- No policies created: with RLS enabled and zero policies, anon/authenticated
-- can never read or write this table. Only service_role (which bypasses RLS)
-- can, and only through the RPC below.
revoke all on table public.gear_feedback_rate_limits from anon, authenticated;

create or replace function public.gear_feedback_check_rate_limit(
  p_user_id uuid,
  p_ip_hash text default null
)
returns table(allowed boolean, minute_count integer, hour_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_minute_start timestamptz := date_trunc('minute', now());
  v_hour_start timestamptz := date_trunc('hour', now());
  v_minute_count integer;
  v_hour_count integer;
begin
  insert into public.gear_feedback_rate_limits (user_id, window_kind, window_start, attempt_count, ip_hash, updated_at)
  values (p_user_id, 'minute', v_minute_start, 1, p_ip_hash, now())
  on conflict (user_id, window_kind, window_start)
  do update set
    attempt_count = public.gear_feedback_rate_limits.attempt_count + 1,
    ip_hash = coalesce(excluded.ip_hash, public.gear_feedback_rate_limits.ip_hash),
    updated_at = now()
  returning attempt_count into v_minute_count;

  insert into public.gear_feedback_rate_limits (user_id, window_kind, window_start, attempt_count, ip_hash, updated_at)
  values (p_user_id, 'hour', v_hour_start, 1, p_ip_hash, now())
  on conflict (user_id, window_kind, window_start)
  do update set
    attempt_count = public.gear_feedback_rate_limits.attempt_count + 1,
    ip_hash = coalesce(excluded.ip_hash, public.gear_feedback_rate_limits.ip_hash),
    updated_at = now()
  returning attempt_count into v_hour_count;

  return query select (v_minute_count <= 5 and v_hour_count <= 30), v_minute_count, v_hour_count;
end;
$$;

revoke all on function public.gear_feedback_check_rate_limit(uuid, text) from public, anon, authenticated;
grant execute on function public.gear_feedback_check_rate_limit(uuid, text) to service_role;

commit;
