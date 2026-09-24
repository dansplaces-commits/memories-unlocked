-- Memories Unlocked — reversible archive support.
-- Safe additive migration: no existing rows are removed or rewritten.

alter table public.journeys
  add column if not exists archived_at timestamptz;

alter table public.memories
  add column if not exists archived_at timestamptz;

create index if not exists journeys_owner_archived_idx
  on public.journeys (owner_id, archived_at);

create index if not exists memories_owner_archived_idx
  on public.memories (owner_id, archived_at);
