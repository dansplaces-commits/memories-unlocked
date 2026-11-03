-- Memories Unlocked / Travel Photo Vault. Additive only: existing journeys,
-- memories, accounts and storage objects remain unchanged.
create table if not exists public.photo_vault_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  file_path text not null,
  preview_path text,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 26214400),
  taken_at timestamptz,
  taken_local text,
  date_source text not null default 'file' check (date_source in ('exif','file','camera')),
  latitude double precision,
  longitude double precision,
  folder_label text not null default 'Unsorted',
  trip_label text not null default '',
  fingerprint text not null,
  source text not null default 'import' check (source in ('import','camera')),
  linked_memory_id uuid references public.memories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vault_file_own_path check (file_path like (owner_id::text || '/vault/%')),
  constraint vault_preview_own_path check (preview_path is null or preview_path like (owner_id::text || '/vault/%')),
  constraint vault_gps_pairs check ((latitude is null and longitude is null) or (latitude between -90 and 90 and longitude between -180 and 180)),
  constraint vault_unique_file unique (owner_id,file_path),
  constraint vault_unique_fingerprint unique (owner_id,fingerprint)
);
create index if not exists vault_owner_taken_idx on public.photo_vault_items(owner_id,taken_at desc);
alter table public.photo_vault_items enable row level security;
create policy vault_select_own on public.photo_vault_items for select to authenticated
 using (owner_id = (select auth.uid()) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false) is false);
create policy vault_insert_own on public.photo_vault_items for insert to authenticated
 with check (owner_id = (select auth.uid()) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false) is false and (linked_memory_id is null or exists (select 1 from public.memories m where m.id = linked_memory_id and m.owner_id = (select auth.uid()))));
create policy vault_update_own on public.photo_vault_items for update to authenticated
 using (owner_id = (select auth.uid()) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false) is false)
 with check (owner_id = (select auth.uid()) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false) is false and (linked_memory_id is null or exists (select 1 from public.memories m where m.id = linked_memory_id and m.owner_id = (select auth.uid()))));
create policy vault_delete_own on public.photo_vault_items for delete to authenticated
 using (owner_id = (select auth.uid()) and coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false) is false);
grant select,insert,update,delete on public.photo_vault_items to authenticated;
