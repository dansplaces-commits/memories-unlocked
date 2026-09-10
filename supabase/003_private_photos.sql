-- Run once in the existing Supabase project's SQL Editor after migration 001.
-- Adds one private photo per saved memory. Does not modify journey/story rows.
begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('memory-photos','memory-photos',false,5242880,array['image/jpeg'])
on conflict(id) do nothing;
do $$ begin
 if not exists(select 1 from storage.buckets where id='memory-photos' and public=false
  and file_size_limit=5242880 and allowed_mime_types=array['image/jpeg']) then
  raise exception 'Existing memory-photos bucket has different settings. Stop and review; no changes committed.';
 end if;
end $$;
-- Restrictive guard also protects this bucket when another broad permissive
-- policy exists. Existing policies/objects belonging to other buckets are kept.
create policy memory_photos_guard on storage.objects as restrictive for all to public
using (bucket_id<>'memory-photos' or (
 (select auth.uid()) is not null
 and exists(select 1 from public.memories m where m.owner_id=(select auth.uid())
  and storage.objects.name=m.owner_id::text||'/'||m.id::text||'/photo.jpg')
))
with check (bucket_id<>'memory-photos' or (
 (select auth.uid()) is not null
 and exists(select 1 from public.memories m where m.owner_id=(select auth.uid())
  and storage.objects.name=m.owner_id::text||'/'||m.id::text||'/photo.jpg')
));
create policy memory_photos_read on storage.objects for select to authenticated
using(bucket_id='memory-photos');
create policy memory_photos_insert on storage.objects for insert to authenticated
with check(bucket_id='memory-photos');
-- Prevent accidental replacement even if unrelated broad UPDATE policies exist.
create policy memory_photos_no_replace on storage.objects as restrictive for update to public
using(bucket_id<>'memory-photos') with check(bucket_id<>'memory-photos');
commit;
