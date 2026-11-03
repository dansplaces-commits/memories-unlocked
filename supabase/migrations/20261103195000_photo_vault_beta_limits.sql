-- Keep the public Photo Vault beta within the no-new-spending pilot.
-- Older accounts, memories, photos and journeys are unaffected.
revoke all on table public.photo_vault_items from public, anon;
grant select, insert, update, delete on table public.photo_vault_items to authenticated;
alter table public.photo_vault_items
  add constraint vault_beta_max_photo_bytes check (size_bytes <= 8388608);
create or replace function public.mu_photo_vault_beta_limit()
returns trigger
language plpgsql security invoker set search_path = ''
as $$
begin
  if (select count(*) from public.photo_vault_items where owner_id = new.owner_id) >= 20 then
    raise exception 'Photo Vault early-access limit reached (20 photos).'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger vault_beta_limit
before insert on public.photo_vault_items
for each row execute function public.mu_photo_vault_beta_limit();
