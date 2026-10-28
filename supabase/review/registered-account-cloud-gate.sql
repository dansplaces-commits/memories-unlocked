-- REVIEWED LAUNCH HARDENING — NOT AUTO-APPLIED
-- This script was transaction-tested against the live schema on 9 October 2026.
-- Registered identity test: gate=true, 4 owned journeys visible.
-- Anonymous identity test: gate=false, 0 journeys visible.
--
-- Before turning this into an official Supabase migration:
-- 1. review the one existing anonymous-owned journey and media object;
-- 2. create the migration with the Supabase CLI migration command;
-- 3. apply only after the launch candidate client code for device-local anonymous use is deployed/tested.

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_registered_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = (select auth.uid())
      and coalesce(u.is_anonymous, false) = false
  );
$$;

revoke all on function private.is_registered_active_user() from public;
grant execute on function private.is_registered_active_user() to authenticated;

drop policy if exists "MU registered account gate" on public.journeys;
create policy "MU registered account gate"
on public.journeys
as restrictive
for all
to authenticated
using ((select private.is_registered_active_user()))
with check ((select private.is_registered_active_user()));

drop policy if exists "MU registered account gate" on public.memories;
create policy "MU registered account gate"
on public.memories
as restrictive
for all
to authenticated
using ((select private.is_registered_active_user()))
with check ((select private.is_registered_active_user()));

drop policy if exists "MU registered account gate" on public.memory_unlocks;
create policy "MU registered account gate"
on public.memory_unlocks
as restrictive
for all
to authenticated
using ((select private.is_registered_active_user()))
with check ((select private.is_registered_active_user()));

drop policy if exists "MU registered media gate" on storage.objects;
create policy "MU registered media gate"
on storage.objects
as restrictive
for all
to authenticated
using (
  bucket_id <> 'memory-media'
  or (select private.is_registered_active_user())
)
with check (
  bucket_id <> 'memory-media'
  or (select private.is_registered_active_user())
);
