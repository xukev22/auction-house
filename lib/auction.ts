// Rows from supabase/game.sql and supabase/items.sql, shared by the host and live pages.

export type Stage = 'bidding' | 'going once' | 'going twice';

export type Game = {
  id: number;
  name: string;
  starting_budget: number;
  started_at: string | null;
  ended_at: string | null;
  current_item_id: number | null;
  stage: Stage | null;
};

// A row from game_roster(): a player with their Google name and photo, and what they've spent.
export type Player = {
  player_id: string;
  name: string;
  avatar_url: string | null;
  budget: number;
  spent: number;
  money_left: number;
  lots_won: number;
};

export type Lot = {
  id: number;
  lot_number: number;
  title: string;
  size: string | null;
  description: string | null;
  // Cover photo first.
  image_paths: string[];
};

export type Bid = { id: number; player_id: string; amount: number; created_at: string };

// No player means no sale. A player with an amount of 0 means a pity win.
export type Sale = { item_id: number; player_id: string | null; amount: number; sold_at: string };

export const STAGE_HEADLINE: Record<Stage, string> = {
  bidding: 'Bidding is open',
  'going once': 'Going once',
  'going twice': 'Going twice',
};

// A photo in the public "lots" storage bucket.
export const photoUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/lots/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

export const firstName = (name: string) => name.split(' ')[0];

// "One size" already says it; "L" needs the label.
export const sizeLabel = (size: string) => (/size/i.test(size) ? size : `Size ${size}`);
