-- Memories Unlocked: first private collection schema.
-- Run once in this project's Supabase SQL Editor. Transactional; no sample data.
-- Deliberately fails if either table already exists. Inspect that schema first.
-- Never drop an existing table to make this migration pass.
begin;
create table public.journeys (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  story text not null default '' check (char_length(story) <= 10000),
  location text not null default '' check (char_length(location) <= 200),
  start_date date,
  end_date date,
  visibility text not null default 'private' check (visibility = 'private'),
  created_at timestamptz not null default now(),
  constraint journeys_dates_valid check (end_date is null or (start_date is not null and end_date >= start_date)),
  constraint journeys_owner_pair unique (id, owner_id)
);
create table public.memories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  journey_id uuid not null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  story text not null check (char_length(btrim(story)) between 1 and 10000),
  location text not null default '' check (char_length(location) <= 200),
  memory_date date,
  created_at timestamptz not null default now(),
  constraint memories_owned_journey foreign key (journey_id, owner_id) references public.journeys(id, owner_id) on delete cascade
);
create index journeys_owner_created on public.journeys(owner_id, created_at desc, id desc);
create index memories_journey_owner_created on public.memories(journey_id, owner_id, created_at desc, id desc);
alter table public.journeys enable row level security;
alter table public.memories enable row level security;
-- Remove default broad grants on these newly created tables only.
revoke all on public.journeys, public.memories from anon, authenticated;
grant select, insert on public.journeys, public.memories to authenticated;
create policy journeys_read_own on public.journeys for select to authenticated using ((select auth.uid()) = owner_id);
create policy journeys_insert_own on public.journeys for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy memories_read_own on public.memories for select to authenticated using ((select auth.uid()) = owner_id);
create policy memories_insert_own on public.memories for insert to authenticated with check ((select auth.uid()) = owner_id);
notify pgrst, 'reload schema';
commit;
