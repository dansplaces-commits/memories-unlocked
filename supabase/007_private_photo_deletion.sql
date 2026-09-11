-- Run after 003_private_photos.sql. Allows an owner to delete the one photo at the immutable memory path.
begin;
drop policy if exists memory_photos_delete on storage.objects;
create policy memory_photos_delete on storage.objects for delete to authenticated
using(bucket_id='memory-photos' and exists(
  select 1 from public.memories m
  where m.owner_id=(select auth.uid())
    and storage.objects.name=m.owner_id::text||'/'||m.id::text||'/photo.jpg'
));
commit;
