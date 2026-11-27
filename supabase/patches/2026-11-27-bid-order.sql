-- Patch for a database that already ran game.sql (game.sql itself now includes this).
-- "Undo last bid" picked the newest bid by timestamp, which can be out of order when two bids
-- land in the same instant. Bid ids are always in the order bids were accepted, so use those.
-- Run once in the SQL Editor.

begin;

alter table public.bids alter column created_at set default clock_timestamp();

-- create or replace keeps the existing permissions (only the secret key can call it).
create or replace function public.host_undo_last_bid()
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_game public.games;
begin
  v_game := public.lock_live_game();
  if v_game.current_item_id is null then
    raise exception 'No lot is up.';
  end if;

  -- Ids follow the order bids were accepted in, even when two land in the same instant.
  delete from public.bids
  where id = (
    select id from public.bids
    where game_id = v_game.id and item_id = v_game.current_item_id
    order by id desc
    limit 1
  );
  if not found then
    raise exception 'There are no bids to undo.';
  end if;
end;
$$;

commit;
