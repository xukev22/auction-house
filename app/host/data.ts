import 'server-only';
import { createHostClient } from '@/utils/host';

// Rows from supabase/game.sql and supabase/items.sql, as the host page uses them.
export type Game = {
  id: number;
  name: string;
  starting_budget: number;
  started_at: string | null;
  ended_at: string | null;
  current_item_id: number | null;
  stage: 'bidding' | 'going once' | 'going twice' | null;
};
export type Player = {
  player_id: string;
  name: string;
  avatar_url: string | null;
  budget: number;
  spent: number;
  money_left: number;
  lots_won: number;
};
export type Lot = { id: number; lot_number: number; title: string; image_paths: string[] };
export type Bid = { id: number; player_id: string; amount: number; created_at: string };
export type Sale = { item_id: number; player_id: string | null; amount: number };
export type Account = { id: string; name: string; email: string; avatarUrl: string | null };

export async function getGames() {
  const { data } = await createHostClient()
    .from('games')
    .select('id, name, starting_budget, started_at, ended_at, current_item_id, stage')
    .order('created_at', { ascending: false });
  return (data ?? []) as Game[];
}

// Everyone in a game with their name, photo, budget and money left (game_roster in game.sql).
export async function getRoster(gameId: number) {
  const { data } = await createHostClient().rpc('game_roster', { p_game_id: gameId });
  return (data ?? []) as Player[];
}

export async function getLots() {
  const { data } = await createHostClient()
    .from('items')
    .select('id, lot_number, title, image_paths')
    .order('lot_number');
  return (data ?? []) as Lot[];
}

export async function getSales(gameId: number) {
  const { data } = await createHostClient()
    .from('sales')
    .select('item_id, player_id, amount')
    .eq('game_id', gameId);
  return (data ?? []) as Sale[];
}

// Bids on one lot, newest first. Ids are handed out in the order bids are accepted, so they're
// a truer order than timestamps when two bids land in the same instant.
export async function getBids(gameId: number, itemId: number) {
  const { data } = await createHostClient()
    .from('bids')
    .select('id, player_id, amount, created_at')
    .eq('game_id', gameId)
    .eq('item_id', itemId)
    .order('id', { ascending: false });
  return (data ?? []) as Bid[];
}

// Everyone who has ever signed in, for picking players.
export async function getAccounts() {
  const { data } = await createHostClient().auth.admin.listUsers({ perPage: 1000 });
  return (data?.users ?? [])
    .map((user): Account => ({
      id: user.id,
      name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        user.email ??
        'Unknown',
      email: user.email ?? '',
      avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function photoUrl(path: string) {
  return createHostClient().storage.from('lots').getPublicUrl(path).data.publicUrl;
}

export const firstName = (name: string) => name.split(' ')[0];
