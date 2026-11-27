import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Bid, Game, Lot, Player, Sale } from './auction';

// Reads shared by the host page (secret key) and the live page (the player's own sign-in;
// signed-in people can read all of these, see supabase/game.sql).

const GAME_COLUMNS = 'id, name, starting_budget, started_at, ended_at, current_item_id, stage';

export async function getGames(db: SupabaseClient) {
  const { data } = await db
    .from('games')
    .select(GAME_COLUMNS)
    .order('created_at', { ascending: false });
  return (data ?? []) as Game[];
}

// Everyone in a game with their name, photo, budget and money left (game_roster in game.sql).
export async function getRoster(db: SupabaseClient, gameId: number) {
  const { data } = await db.rpc('game_roster', { p_game_id: gameId });
  return (data ?? []) as Player[];
}

export async function getLots(db: SupabaseClient) {
  const { data } = await db
    .from('items')
    .select('id, lot_number, title, size, description, image_paths')
    .order('lot_number');
  return (data ?? []) as Lot[];
}

// Closed lots in a game, most recent first.
export async function getSales(db: SupabaseClient, gameId: number) {
  const { data } = await db
    .from('sales')
    .select('item_id, player_id, amount, sold_at')
    .eq('game_id', gameId)
    .order('sold_at', { ascending: false });
  return (data ?? []) as Sale[];
}

// Bids on one lot, newest first. Ids are handed out in the order bids are accepted, so they're
// a truer order than timestamps when two bids land in the same instant.
export async function getBids(db: SupabaseClient, gameId: number, itemId: number) {
  const { data } = await db
    .from('bids')
    .select('id, player_id, amount, created_at')
    .eq('game_id', gameId)
    .eq('item_id', itemId)
    .order('id', { ascending: false });
  return (data ?? []) as Bid[];
}
