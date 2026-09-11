-- Add editing without deleting records or changing ownership/sharing.
-- Apply after 001_private_collection.sql. Safe to rerun this migration.
begin;
grant update (title, story, location, start_date, end_date) on public.journeys to authenticated;
grant update (title, story, location, memory_date) on public.memories to authenticated;
drop policy if exists journeys_update_own on public.journeys;
create policy journeys_update_own on public.journeys for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
drop policy if exists memories_update_own on public.memories;
create policy memories_update_own on public.memories for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
notify pgrst, 'reload schema';
commit;
