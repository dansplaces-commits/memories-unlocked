-- Additive only. Run in the EXISTING Memories Unlocked Supabase project if
-- these optional fields are missing. This does not change records or RLS.
begin;
alter table public.memories add column if not exists clue text;
alter table public.memories add column if not exists latitude double precision;
alter table public.memories add column if not exists longitude double precision;
alter table public.journeys add column if not exists share_code text;
notify pgrst, 'reload schema';
commit;
-- Existing device-only clues/positions can then be retried from their memory.
-- This migration does not grant cross-account access or implement sharing.
