-- Memories Unlocked — secure journey-cover and memory-photo storage
-- Run once in the Supabase SQL editor before enabling photo uploads in production.

alter table public.journeys
  add column if not exists cover_photo_path text;

alter table public.memories
  add column if not exists photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-media',
  'memory-media',
  false,
  8388608,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "MU media select own" on storage.objects;
create policy "MU media select own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'memory-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "MU media insert own" on storage.objects;
create policy "MU media insert own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'memory-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "MU media update own" on storage.objects;
create policy "MU media update own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'memory-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'memory-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "MU media delete own" on storage.objects;
create policy "MU media delete own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'memory-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
