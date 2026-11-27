import 'server-only';
import * as queries from '@/lib/auction-queries';
import { createHostClient } from '@/utils/host';

export type { Bid, Game, Lot, Player, Sale } from '@/lib/auction';
export { firstName, photoUrl } from '@/lib/auction';
export type Account = { id: string; name: string; email: string; avatarUrl: string | null };

// The shared reads, run with the secret key (the host page has already checked it's the host).
export const getGames = () => queries.getGames(createHostClient());
export const getRoster = (gameId: number) => queries.getRoster(createHostClient(), gameId);
export const getLots = () => queries.getLots(createHostClient());
export const getSales = (gameId: number) => queries.getSales(createHostClient(), gameId);
export const getBids = (gameId: number, itemId: number) =>
  queries.getBids(createHostClient(), gameId, itemId);

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
