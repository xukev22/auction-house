-- The auction: games, who's playing, bids and sales. Run once in the SQL Editor, after items.sql.
--
--   games         One row per auction. Holds the live state: which lot is up and what you last called.
--   game_players  Who's in each game, and their budget.
--   bids          Every bid. Only "undo last bid" ever removes one.
--   sales         One row per closed lot: who won it and for how much (no player = no sale).
--
-- Money left and the high bid are calculated from bids and sales, never stored.
--
-- Who can change what:
--   Players bid through place_bid(), which checks the rules.
--   Host actions are the host_* functions. Only the secret key can call them, and the site
--   only uses it after checking you're ADMIN_EMAIL.
--   Signed-in people can read everything. Nobody can write a table directly.

begin;

-- Tables ---------------------------------------------------------------------------------------

create table public.games (
  id bigint generated always as identity primary key,
  name text not null,
  -- What each player starts with when you add them. You can change anyone's afterwards.
  starting_budget int not null default 100 check (starting_budget >= 0),
  -- Not started: you're setting up. Started but not ended: live. Ended: over.
  started_at timestamptz,
  ended_at timestamptz,
  -- The lot that's up and what you last called on it. Both empty between lots.
  current_item_id bigint references public.items (id),
  stage text check (stage in ('bidding', 'going once', 'going twice')),
  created_at timestamptz not null default now(),
  check (ended_at is null or started_at is not null),
  check ((current_item_id is null) = (stage is null))
);

-- Only one game can be live at a time.
create unique index games_one_live on public.games ((true))
  where started_at is not null and ended_at is null;

create table public.game_players (
  game_id bigint not null references public.games (id) on delete cascade,
  player_id uuid not null references auth.users (id) on delete cascade,
  budget int not null check (budget >= 0),
  primary key (game_id, player_id)
);

create table public.bids (
  id bigint generated always as identity primary key,
  game_id bigint not null,
  item_id bigint not null references public.items (id),
  player_id uuid not null,
  amount int not null check (amount > 0),
  created_at timestamptz not null default now(),
  -- Only people in the game can bid in it.
  foreign key (game_id, player_id) references public.game_players (game_id, player_id)
    on delete cascade
);

create table public.sales (
  game_id bigint not null references public.games (id) on delete cascade,
  item_id bigint not null references public.items (id),
  -- No player means no sale. A pity win has a player and an amount of 0.
  player_id uuid,
  amount int not null default 0 check (amount >= 0),
  sold_at timestamptz not null default now(),
  primary key (game_id, item_id),
  foreign key (game_id, player_id) references public.game_players (game_id, player_id)
    on delete cascade,
  check (player_id is not null or amount = 0)
);

-- Access ---------------------------------------------------------------------------------------

alter table public.games enable row level security;
alter table public.game_players enable row level security;
alter table public.bids enable row level security;
alter table public.sales enable row level security;

create policy "Signed-in people can view games" on public.games
  for select to authenticated using (true);
create policy "Signed-in people can view players" on public.game_players
  for select to authenticated using (true);
create policy "Signed-in people can view bids" on public.bids
  for select to authenticated using (true);
create policy "Signed-in people can view sales" on public.sales
  for select to authenticated using (true);

-- Reading only. Writes go through the functions below.
revoke all on public.games, public.game_players, public.bids, public.sales from anon, authenticated;
grant select on public.games, public.game_players, public.bids, public.sales to authenticated;
grant all on public.games, public.game_players, public.bids, public.sales to service_role;

-- Live updates: phones get told when any of these change.
alter publication supabase_realtime
  add table public.games, public.game_players, public.bids, public.sales;

-- Shared helpers -------------------------------------------------------------------------------

-- The live game, locked until the current action finishes, so bids and host actions
-- happen one at a time (two bids in the same instant can't both win).
create function public.lock_live_game()
returns public.games
language plpgsql
set search_path = ''
as $$
declare
  v_game public.games;
begin
  select * into v_game
  from public.games
  where started_at is not null and ended_at is null
  for update;

  if not found then
    raise exception 'No game is live.';
  end if;
  return v_game;
end;
$$;

-- Everyone in a game, with their Google name and photo, budget, spending and lots won.
create function public.game_roster(p_game_id bigint)
returns table (
  player_id uuid,
  name text,
  avatar_url text,
  budget int,
  spent int,
  money_left int,
  lots_won int
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    gp.player_id,
    coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', 'Player'),
    u.raw_user_meta_data ->> 'avatar_url',
    gp.budget,
    coalesce(s.spent, 0)::int,
    (gp.budget - coalesce(s.spent, 0))::int,
    coalesce(s.won, 0)::int
  from public.game_players gp
  join auth.users u on u.id = gp.player_id
  left join (
    select sales.player_id, sum(sales.amount) as spent, count(*) as won
    from public.sales
    where sales.game_id = p_game_id and sales.player_id is not null
    group by sales.player_id
  ) s on s.player_id = gp.player_id
  where gp.game_id = p_game_id
  order by 2;
$$;

-- Bidding --------------------------------------------------------------------------------------

-- Bids on the lot that's up, as whoever is signed in.
create function public.place_bid(p_amount int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game public.games;
  v_top public.bids;
  v_budget int;
  v_spent int;
begin
  if p_amount is null or p_amount < 1 then
    raise exception 'Bids start at 1.';
  end if;

  v_game := public.lock_live_game();
  if v_game.current_item_id is null then
    raise exception 'No lot is up right now.';
  end if;

  select budget into v_budget
  from public.game_players
  where game_id = v_game.id and player_id = auth.uid();
  if not found then
    raise exception 'You''re not playing in this game.';
  end if;

  select * into v_top
  from public.bids
  where game_id = v_game.id and item_id = v_game.current_item_id
  order by amount desc
  limit 1;
  if found then
    -- Stops a double tap from bidding against yourself.
    if v_top.player_id = auth.uid() then
      raise exception 'You''re already the high bidder.';
    end if;
    if p_amount <= v_top.amount then
      raise exception 'The high bid is already %. Bid more than that.', v_top.amount;
    end if;
  end if;

  select coalesce(sum(amount), 0) into v_spent
  from public.sales
  where game_id = v_game.id and player_id = auth.uid();
  if p_amount > v_budget - v_spent then
    raise exception 'You only have % left.', v_budget - v_spent;
  end if;

  insert into public.bids (game_id, item_id, player_id, amount)
  values (v_game.id, v_game.current_item_id, auth.uid(), p_amount);

  -- A new bid cancels "going once" or "going twice".
  update public.games set stage = 'bidding'
  where id = v_game.id and stage <> 'bidding';
end;
$$;

-- Host: setting up a game ----------------------------------------------------------------------

create function public.host_create_game(p_name text, p_starting_budget int default 100)
returns bigint
language sql
set search_path = ''
as $$
  insert into public.games (name, starting_budget)
  values (p_name, p_starting_budget)
  returning id;
$$;

-- Adds accounts to a game, each starting with the game's starting budget.
create function public.host_add_players(p_game_id bigint, p_player_ids uuid[])
returns void
language sql
set search_path = ''
as $$
  insert into public.game_players (game_id, player_id, budget)
  select g.id, p.player_id, g.starting_budget
  from public.games g
  cross join unnest(p_player_ids) as p (player_id)
  where g.id = p_game_id
  on conflict (game_id, player_id) do nothing;
$$;

create function public.host_remove_player(p_game_id bigint, p_player_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.bids where game_id = p_game_id and player_id = p_player_id)
    or exists (select 1 from public.sales where game_id = p_game_id and player_id = p_player_id)
  then
    raise exception 'They''ve already bid or won a lot in this game, so they can''t be removed.';
  end if;

  delete from public.game_players where game_id = p_game_id and player_id = p_player_id;
end;
$$;

create function public.host_set_budget(p_game_id bigint, p_player_id uuid, p_budget int)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_spent int;
begin
  select coalesce(sum(amount), 0) into v_spent
  from public.sales
  where game_id = p_game_id and player_id = p_player_id;
  if p_budget < v_spent then
    raise exception 'They''ve already spent %, so their budget can''t go below that.', v_spent;
  end if;

  update public.game_players set budget = p_budget
  where game_id = p_game_id and player_id = p_player_id;
  if not found then
    raise exception 'They''re not in that game.';
  end if;
end;
$$;

create function public.host_start_game(p_game_id bigint)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.games where started_at is not null and ended_at is null) then
    raise exception 'Another game is live. End it first.';
  end if;

  update public.games set started_at = now()
  where id = p_game_id and started_at is null;
  if not found then
    raise exception 'That game doesn''t exist or has already started.';
  end if;
end;
$$;

create function public.host_end_game()
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_game public.games;
begin
  v_game := public.lock_live_game();
  if v_game.current_item_id is not null then
    raise exception 'Close the current lot first.';
  end if;

  update public.games set ended_at = now() where id = v_game.id;
end;
$$;

-- Host: running lots ---------------------------------------------------------------------------

create function public.host_start_lot(p_item_id bigint)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_game public.games;
begin
  v_game := public.lock_live_game();
  if v_game.current_item_id is not null then
    raise exception 'Another lot is up. Close it first.';
  end if;
  if exists (select 1 from public.sales where game_id = v_game.id and item_id = p_item_id) then
    raise exception 'That lot is already closed. Reopen it instead.';
  end if;

  update public.games set current_item_id = p_item_id, stage = 'bidding'
  where id = v_game.id;
end;
$$;

-- 'going once', 'going twice', or back to 'bidding'.
create function public.host_call(p_stage text)
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

  update public.games set stage = p_stage where id = v_game.id;
end;
$$;

-- Sells the lot that's up to the high bidder, at their bid.
create function public.host_sell()
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_game public.games;
  v_top public.bids;
begin
  v_game := public.lock_live_game();
  if v_game.current_item_id is null then
    raise exception 'No lot is up.';
  end if;

  select * into v_top
  from public.bids
  where game_id = v_game.id and item_id = v_game.current_item_id
  order by amount desc, created_at
  limit 1;
  if not found then
    raise exception 'Nobody has bid on this lot. Use No sale instead.';
  end if;

  insert into public.sales (game_id, item_id, player_id, amount)
  values (v_game.id, v_game.current_item_id, v_top.player_id, v_top.amount);

  update public.games set current_item_id = null, stage = null where id = v_game.id;
end;
$$;

-- Closes a lot nobody bid on. Pass a player to give it to them free (a pity win).
create function public.host_no_sale(p_give_to uuid default null)
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
  if exists (
    select 1 from public.bids where game_id = v_game.id and item_id = v_game.current_item_id
  ) then
    raise exception 'This lot has bids. Use Sold instead.';
  end if;

  insert into public.sales (game_id, item_id, player_id, amount)
  values (v_game.id, v_game.current_item_id, p_give_to, 0);

  update public.games set current_item_id = null, stage = null where id = v_game.id;
end;
$$;

-- Removes the newest bid on the lot that's up (for a fat-finger bid).
create function public.host_undo_last_bid()
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

  delete from public.bids
  where id = (
    select id from public.bids
    where game_id = v_game.id and item_id = v_game.current_item_id
    order by created_at desc, id desc
    limit 1
  );
  if not found then
    raise exception 'There are no bids to undo.';
  end if;
end;
$$;

-- Puts a closed lot back up with its bids as they were (for a Sold tapped too early).
create function public.host_reopen_lot(p_item_id bigint)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_game public.games;
begin
  v_game := public.lock_live_game();
  if v_game.current_item_id is not null then
    raise exception 'Close the current lot first.';
  end if;

  delete from public.sales where game_id = v_game.id and item_id = p_item_id;
  if not found then
    raise exception 'That lot hasn''t been closed.';
  end if;

  update public.games set current_item_id = p_item_id, stage = 'bidding'
  where id = v_game.id;
end;
$$;

-- Who can call what ----------------------------------------------------------------------------

-- New functions are callable by everyone by default, so start from nobody.
revoke execute on function
  public.lock_live_game,
  public.game_roster,
  public.place_bid,
  public.host_create_game,
  public.host_add_players,
  public.host_remove_player,
  public.host_set_budget,
  public.host_start_game,
  public.host_end_game,
  public.host_start_lot,
  public.host_call,
  public.host_sell,
  public.host_no_sale,
  public.host_undo_last_bid,
  public.host_reopen_lot
from public, anon, authenticated;

-- Signed-in players: see who's playing, and bid.
grant execute on function public.game_roster, public.place_bid to authenticated;

-- The secret key (the site's host actions): everything except bidding.
grant execute on function
  public.lock_live_game,
  public.game_roster,
  public.host_create_game,
  public.host_add_players,
  public.host_remove_player,
  public.host_set_budget,
  public.host_start_game,
  public.host_end_game,
  public.host_start_lot,
  public.host_call,
  public.host_sell,
  public.host_no_sale,
  public.host_undo_last_bid,
  public.host_reopen_lot
to service_role;

commit;
