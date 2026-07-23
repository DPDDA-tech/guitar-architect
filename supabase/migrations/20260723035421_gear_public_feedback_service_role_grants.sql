-- Corrective migration: grant service_role direct table access on
-- gear_public_feedback.
--
-- Root cause (confirmed via read-only inspection of the production database
-- on 2026-07-23): the original migration
-- (20260723000215_gear_public_feedback.sql) revoked all privileges from
-- anon/authenticated and granted select-only to authenticated, but never
-- explicitly granted service_role anything on this table. The incorrect
-- assumption documented at the time was that "service_role bypasses grants
-- and RLS entirely by default" — that is only half true. service_role has
-- the BYPASSRLS attribute (it ignores Row Level Security policies), but it
-- is an ordinary role, not a superuser, so it still needs standard table
-- GRANTs for SELECT/INSERT/UPDATE/DELETE like any other role.
--
-- In production this caused every submission to fail after Turnstile and
-- the rate-limit RPC both succeeded: the submit-gear-feedback Edge
-- Function's first direct table call (a SELECT used to decide whether the
-- upsert is a create or an update) hit "permission denied for table
-- gear_public_feedback" and the function returned a generic 500
-- unexpected_error.
--
-- The rate-limit RPC (gear_feedback_check_rate_limit) was NOT affected by
-- this gap: it is `security definer`, so it always runs with the
-- privileges of its owner (postgres), regardless of the caller's own
-- grants. That is also why gear_feedback_rate_limits itself does not need
-- a service_role grant here — nothing in the application code accesses it
-- directly; every access goes through that security definer RPC.
--
-- This migration only adds the missing grant. It does not touch RLS,
-- policies, or any other object.

grant select, insert, update
  on table public.gear_public_feedback
  to service_role;
