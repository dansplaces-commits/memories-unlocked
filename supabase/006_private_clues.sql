-- Run after 001 and the owner-editing migration. Adds an optional private clue to each memory.
begin;
alter table public.memories add column if not exists clue text not null default '';
do $$
begin
  if not exists (select 1 from pg_constraint where conrelid='public.memories'::regclass and conname='memories_clue_length_valid') then
    alter table public.memories add constraint memories_clue_length_valid check (char_length(clue) <= 5000);
  end if;
end $$;
grant update (clue) on public.memories to authenticated;
notify pgrst, 'reload schema';
commit;
