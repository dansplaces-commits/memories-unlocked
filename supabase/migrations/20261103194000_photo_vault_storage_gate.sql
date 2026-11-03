-- Allow newly registered customers to use only their own /vault/ objects
-- within the existing private memory-media bucket. Preserve all legacy
-- restrictions for every existing journeys/ and memories/ storage path.
-- The separate restrictive mu_deletion_fence remains unchanged.
drop policy if exists mu_trial_media_server on storage.objects;
create policy mu_trial_media_server on storage.objects
as restrictive for all to authenticated
using (
  bucket_id <> 'memory-media'
  or (select mu_v2_early_access.legacy_client())
  or (
    bucket_id = 'memory-media'
    and (storage.foldername(name))[2] = 'vault'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false) is false
  )
)
with check (
  bucket_id <> 'memory-media'
  or (select mu_v2_early_access.legacy_client())
  or (
    bucket_id = 'memory-media'
    and (storage.foldername(name))[2] = 'vault'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false) is false
  )
);
