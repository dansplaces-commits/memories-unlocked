-- Memories Unlocked — keep cloud validation aligned with the memory form.
-- A memory title and location are required in the app; story text is optional.

alter table public.memories
  drop constraint if exists memories_story_check;

alter table public.memories
  add constraint memories_story_check
  check (char_length(story) <= 10000);
