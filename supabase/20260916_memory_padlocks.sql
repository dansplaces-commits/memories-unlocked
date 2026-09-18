-- Memories Unlocked — location padlocks and follower unlock state.
-- Additive only: existing journeys/memories are preserved.

alter table public.memories
  add column if not exists padlock_enabled boolean not null default true,
  add column if not exists unlock_radius_m integer not null default 150;

alter table public.memories
  drop constraint if exists memories_unlock_radius_m_check;

alter table public.memories
  add constraint memories_unlock_radius_m_check
  check (unlock_radius_m between 25 and 5000);

create table if not exists public.memory_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_id uuid not null references public.memories(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  distance_m integer,
  accuracy_m integer,
  method text not null default 'location',
  constraint memory_unlocks_user_memory_key unique (user_id, memory_id),
  constraint memory_unlocks_distance_check check (distance_m is null or distance_m >= 0),
  constraint memory_unlocks_accuracy_check check (accuracy_m is null or accuracy_m >= 0),
  constraint memory_unlocks_method_check check (method in ('location'))
);

create index if not exists memory_unlocks_memory_id_idx
  on public.memory_unlocks (memory_id);

alter table public.memory_unlocks enable row level security;

revoke all on table public.memory_unlocks from anon, authenticated;
grant select, insert, delete on table public.memory_unlocks to authenticated;

drop policy if exists "memory unlocks read own" on public.memory_unlocks;
create policy "memory unlocks read own"
on public.memory_unlocks for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "memory unlocks insert own" on public.memory_unlocks;
create policy "memory unlocks insert own"
on public.memory_unlocks for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "memory unlocks delete own" on public.memory_unlocks;
create policy "memory unlocks delete own"
on public.memory_unlocks for delete
to authenticated
using ((select auth.uid()) = user_id);
