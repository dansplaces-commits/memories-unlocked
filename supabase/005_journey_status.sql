-- Run after 004_location_pins. Classifies journeys as visited, planned or dream destinations.
begin;
alter table public.journeys add column if not exists journey_status text not null default 'visited';
do $$
begin
  if not exists (select 1 from pg_constraint where conrelid='public.journeys'::regclass and conname='journeys_status_valid') then
    alter table public.journeys add constraint journeys_status_valid check (journey_status in ('visited','planned','dream'));
  end if;
end $$;
grant update (journey_status) on public.journeys to authenticated;
notify pgrst, 'reload schema';
commit;
