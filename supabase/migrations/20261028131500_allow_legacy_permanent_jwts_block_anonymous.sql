-- 2026-10-28: retain compatibility with permanent sessions whose JWT predates
-- the is_anonymous=false claim, while still rejecting explicit anonymous users.
-- A missing claim is treated as false; is_anonymous=true remains blocked.

alter policy "journeys_insert_own" on public.journeys
  with check ((select auth.uid()) = owner_id and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
alter policy "journeys_read_own" on public.journeys
  using ((select auth.uid()) = owner_id and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
alter policy "journeys_update_own" on public.journeys
  using ((select auth.uid()) = owner_id and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check ((select auth.uid()) = owner_id and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
alter policy "mu_deletion_fence" on public.journeys
  using ((select mu_deletion_private.account_open()) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check ((select mu_deletion_private.account_open()) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);

alter policy "memories_insert_own" on public.memories
  with check ((select auth.uid()) = owner_id and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
alter policy "memories_read_own" on public.memories
  using ((select auth.uid()) = owner_id and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
alter policy "memories_update_own" on public.memories
  using ((select auth.uid()) = owner_id and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check ((select auth.uid()) = owner_id and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
alter policy "mu_deletion_fence" on public.memories
  using ((select mu_deletion_private.account_open()) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check ((select mu_deletion_private.account_open()) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);

alter policy "memory unlocks insert own" on public.memory_unlocks
  with check ((select auth.uid()) = user_id and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
alter policy "memory unlocks read own" on public.memory_unlocks
  using ((select auth.uid()) = user_id and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
alter policy "memory unlocks delete own" on public.memory_unlocks
  using ((select auth.uid()) = user_id and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
alter policy "mu_deletion_fence" on public.memory_unlocks
  using ((select mu_deletion_private.account_open()) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check ((select mu_deletion_private.account_open()) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);

alter policy "mu_deletion_fence" on public.mu_v2_restore_receipts
  using ((select mu_deletion_private.account_open()) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check ((select mu_deletion_private.account_open()) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);

alter policy "MU media insert own" on storage.objects
  with check (bucket_id='memory-media' and (storage.foldername(name))[1]=(select auth.uid())::text and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
alter policy "MU media select own" on storage.objects
  using (bucket_id='memory-media' and (storage.foldername(name))[1]=(select auth.uid())::text and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
alter policy "MU media update own" on storage.objects
  using (bucket_id='memory-media' and (storage.foldername(name))[1]=(select auth.uid())::text and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check (bucket_id='memory-media' and (storage.foldername(name))[1]=(select auth.uid())::text and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
alter policy "MU media delete own" on storage.objects
  using (bucket_id='memory-media' and (storage.foldername(name))[1]=(select auth.uid())::text and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
alter policy "mu_deletion_fence" on storage.objects
  using ((bucket_id<>'memory-media' or (select mu_deletion_private.account_open())) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check ((bucket_id<>'memory-media' or (select mu_deletion_private.account_open())) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);
