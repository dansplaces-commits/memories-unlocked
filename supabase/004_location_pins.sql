-- Run once after migrations 001 and 002. Adds optional coordinates for map pins.
begin;
alter table public.journeys add column if not exists latitude double precision;
alter table public.journeys add column if not exists longitude double precision;
alter table public.memories add column if not exists latitude double precision;
alter table public.memories add column if not exists longitude double precision;
do $$
begin
  if not exists (select 1 from pg_constraint where conrelid='public.journeys'::regclass and conname='journeys_latitude_valid') then
    alter table public.journeys add constraint journeys_latitude_valid check (latitude is null or latitude between -90 and 90);
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.journeys'::regclass and conname='journeys_longitude_valid') then
    alter table public.journeys add constraint journeys_longitude_valid check (longitude is null or longitude between -180 and 180);
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.journeys'::regclass and conname='journeys_coordinates_pair') then
    alter table public.journeys add constraint journeys_coordinates_pair check ((latitude is null) = (longitude is null));
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.memories'::regclass and conname='memories_latitude_valid') then
    alter table public.memories add constraint memories_latitude_valid check (latitude is null or latitude between -90 and 90);
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.memories'::regclass and conname='memories_longitude_valid') then
    alter table public.memories add constraint memories_longitude_valid check (longitude is null or longitude between -180 and 180);
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.memories'::regclass and conname='memories_coordinates_pair') then
    alter table public.memories add constraint memories_coordinates_pair check ((latitude is null) = (longitude is null));
  end if;
end $$;
grant update (latitude, longitude) on public.journeys to authenticated;
grant update (latitude, longitude) on public.memories to authenticated;
notify pgrst, 'reload schema';
commit;
