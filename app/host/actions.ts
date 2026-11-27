'use server';

import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { createHostClient, getHost } from '@/utils/host';

export type ActionResult = { error?: string };

// Runs one host_* function from supabase/game.sql with the secret key, after checking
// that whoever pressed the button is the host.
async function run(fn: string, args: Record<string, unknown> = {}) {
  if (!(await getHost())) return { error: 'Only the host can do that.', data: null };
  const { data, error } = await createHostClient().rpc(fn, args);
  refresh();
  return { error: error?.message, data };
}

const wholeNumber = (value: FormDataEntryValue | null) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : null;
};

// Setting up ----------------------------------------------------------------------------------

export async function createGame(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const name = String(formData.get('name') ?? '').trim();
  const budget = wholeNumber(formData.get('budget'));
  if (!name) return { error: 'Give the game a name.' };
  if (budget === null) return { error: 'The budget has to be a whole number.' };

  const { error, data } = await run('host_create_game', {
    p_name: name,
    p_starting_budget: budget,
  });
  if (error) return { error };
  redirect(`/host?game=${data}`);
}

export async function addPlayers(
  gameId: number,
  _: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ids = formData.getAll('player').map(String).filter(Boolean);
  if (ids.length === 0) return { error: 'Tick at least one person.' };
  const { error } = await run('host_add_players', { p_game_id: gameId, p_player_ids: ids });
  return { error };
}

export async function removePlayer(gameId: number, playerId: string): Promise<ActionResult> {
  const { error } = await run('host_remove_player', { p_game_id: gameId, p_player_id: playerId });
  return { error };
}

export async function setBudget(
  gameId: number,
  playerId: string,
  _: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const budget = wholeNumber(formData.get('budget'));
  if (budget === null) return { error: 'The budget has to be a whole number.' };
  const { error } = await run('host_set_budget', {
    p_game_id: gameId,
    p_player_id: playerId,
    p_budget: budget,
  });
  return { error };
}

export async function startGame(gameId: number): Promise<ActionResult> {
  const { error } = await run('host_start_game', { p_game_id: gameId });
  return { error };
}

export async function endGame(): Promise<ActionResult> {
  const { error } = await run('host_end_game');
  return { error };
}

// Running lots --------------------------------------------------------------------------------

export async function startLot(itemId: number): Promise<ActionResult> {
  const { error } = await run('host_start_lot', { p_item_id: itemId });
  return { error };
}

export async function callStage(
  stage: 'bidding' | 'going once' | 'going twice',
): Promise<ActionResult> {
  const { error } = await run('host_call', { p_stage: stage });
  return { error };
}

export async function sell(): Promise<ActionResult> {
  const { error } = await run('host_sell');
  return { error };
}

export async function noSale(): Promise<ActionResult> {
  const { error } = await run('host_no_sale');
  return { error };
}

export async function giveLot(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const playerId = String(formData.get('player') ?? '');
  if (!playerId) return { error: 'Pick who gets it.' };
  const { error } = await run('host_no_sale', { p_give_to: playerId });
  return { error };
}

export async function undoLastBid(): Promise<ActionResult> {
  const { error } = await run('host_undo_last_bid');
  return { error };
}

export async function reopenLot(itemId: number): Promise<ActionResult> {
  const { error } = await run('host_reopen_lot', { p_item_id: itemId });
  return { error };
}
