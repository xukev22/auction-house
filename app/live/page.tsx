import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Avatar } from '@/app/Avatar';
import { Countdown } from '@/app/Countdown';
import { LiveRefresh } from '@/app/LiveRefresh';
import { LotPhotos } from '@/app/LotPhotos';
import {
  STAGE_HEADLINE,
  firstName,
  photoUrl,
  sizeLabel,
  type Game,
  type Lot,
  type Player,
  type Sale,
} from '@/lib/auction';
import { getBids, getGames, getLots, getRoster, getSales } from '@/lib/auction-queries';
import { AUCTION_START, AUCTION_WHEN } from '@/lib/event';
import { createClient } from '@/utils/supabase/server';
import { BidControls } from './BidControls';

export const metadata: Metadata = { title: 'Live' };

// The auction as players see it: the lot that's up, the high bid, their bid buttons, and who
// has money left. Reloads itself whenever anything changes (LiveRefresh).
export default async function LivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const games = await getGames(supabase);
  const live = games.find((game) => game.started_at && !game.ended_at);

  return (
    <main className="flex flex-1 flex-col gap-10 px-4 py-6 sm:px-8 md:gap-14 md:px-14 md:py-10">
      <LiveRefresh />
      {live ? (
        <LiveGame db={supabase} game={live} userId={user.id} />
      ) : (
        <NotLive db={supabase} games={games} userId={user.id} />
      )}
    </main>
  );
}

function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <Link href="/" className="font-display text-xl leading-none md:text-2xl">
        Sonu Auction House
      </Link>
      {children}
    </header>
  );
}

async function LiveGame({ db, game, userId }: { db: SupabaseClient; game: Game; userId: string }) {
  const [players, lots, sales] = await Promise.all([
    getRoster(db, game.id),
    getLots(db),
    getSales(db, game.id),
  ]);
  const current = lots.find((lot) => lot.id === game.current_item_id);
  const bids = current ? await getBids(db, game.id, current.id) : [];

  const me = players.find((player) => player.player_id === userId);
  const playerOf = new Map(players.map((player) => [player.player_id, player]));
  const lotOf = new Map(lots.map((lot) => [lot.id, lot]));
  const nameFor = (id: string) =>
    id === userId ? 'You' : firstName(playerOf.get(id)?.name ?? 'Someone');
  // Bids only go up, so the newest bid is the high bid.
  const top = bids[0];
  const lastSale = sales[0];
  const lastLot = lastSale && lotOf.get(lastSale.item_id);

  return (
    <>
      <Header>
        {me && (
          <p className="flex items-center gap-2 text-sm text-cream/70">
            <Avatar url={me.avatar_url} name={me.name} size={28} />
            <span>
              <span className="text-cream tabular-nums">{me.money_left}</span> left
            </span>
          </p>
        )}
      </Header>

      {!me && (
        <p className="text-cream/70">
          You&rsquo;re watching. Ask the host to add you if you want to bid.
        </p>
      )}

      {current && game.stage ? (
        <section
          aria-labelledby="lot-heading"
          className="grid gap-6 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] md:gap-12 lg:gap-16"
        >
          {/* On phones the photo stays short enough that the high bid shows above the bid bar. */}
          <div className="mx-auto w-full max-w-[30svh] md:max-w-none">
            <LotPhotos
              key={current.id}
              title={current.title}
              urls={current.image_paths.map(photoUrl)}
              sizes="(min-width: 768px) 24rem, 30svh"
            />
          </div>
          <div className="flex flex-col gap-6 md:gap-7">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-cream/60">
                Lot {current.lot_number} of {lots.length}
              </p>
              <h1 id="lot-heading" className="font-display text-4xl leading-[0.95] md:text-5xl">
                {current.title}
              </h1>
              <LotDetails lot={current} />
            </div>

            <div aria-live="polite" className="flex flex-col gap-3">
              {game.stage === 'bidding' ? (
                <p className="text-cream/70">{STAGE_HEADLINE.bidding}</p>
              ) : (
                <p className="font-display text-4xl leading-none text-teal md:text-6xl">
                  {STAGE_HEADLINE[game.stage]}&hellip;
                </p>
              )}
              {top ? (
                <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                  <span className="font-display text-7xl leading-[0.8] tabular-nums md:text-8xl">
                    {top.amount}
                  </span>
                  <span className="flex items-center gap-2 pb-1">
                    <Avatar
                      url={playerOf.get(top.player_id)?.avatar_url ?? null}
                      name={nameFor(top.player_id)}
                      size={28}
                    />
                    {nameFor(top.player_id)}
                  </span>
                </div>
              ) : (
                <p className="font-display text-4xl leading-none">No bids yet</p>
              )}
            </div>

            {bids.length > 1 && (
              <div className="flex flex-col gap-2">
                <h2 className="text-sm text-cream/60">Earlier bids</h2>
                <ol className="flex flex-col divide-y divide-cream/10 text-sm">
                  {bids.slice(1, 6).map((bid) => (
                    <li key={bid.id} className="flex justify-between gap-4 py-1.5">
                      <span>{nameFor(bid.player_id)}</span>
                      <span className="tabular-nums">{bid.amount}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section aria-labelledby="result-heading" className="flex flex-col items-start gap-6">
          {lastSale && lastLot ? (
            <>
              <h1
                id="result-heading"
                className={`font-display text-7xl leading-none md:text-8xl ${
                  lastSale.player_id === userId ? 'text-teal' : ''
                }`}
              >
                {resultHeadline(lastSale, userId)}
              </h1>
              <div className="flex items-center gap-4">
                {lastLot.image_paths[0] && (
                  <Image
                    src={photoUrl(lastLot.image_paths[0])}
                    alt=""
                    width={72}
                    height={90}
                    className="aspect-[4/5] w-18 shrink-0 rounded-sm object-cover"
                  />
                )}
                <div>
                  <p className="text-sm text-cream/60">Lot {lastLot.lot_number}</p>
                  <p className="text-xl">{lastLot.title}</p>
                  <p className="text-cream/70">{resultLine(lastSale, userId, nameFor)}</p>
                </div>
              </div>
            </>
          ) : (
            <h1 id="result-heading" className="font-display text-7xl leading-none md:text-8xl">
              We&rsquo;re live
            </h1>
          )}
          <p className="text-cream/70">Waiting for the host to put up the next lot.</p>
        </section>
      )}

      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <Board players={players} userId={userId} />
        {me && <YourLots sales={sales.filter((sale) => sale.player_id === userId)} lotOf={lotOf} />}
      </div>

      {me && current && game.stage && (
        <>
          {/* Room at the bottom so the bid bar never covers the last of the page. */}
          <div aria-hidden className="h-32 shrink-0" />
          <BidControls
            key={`${current.id}-${top?.amount ?? 0}`}
            highBid={top?.amount ?? 0}
            moneyLeft={me.money_left}
            youreHigh={top?.player_id === userId}
          />
        </>
      )}
    </>
  );
}

function LotDetails({ lot }: { lot: Lot }) {
  const details = [lot.size && sizeLabel(lot.size), lot.description].filter(Boolean);
  return details.length > 0 ? <p className="text-cream/70">{details.join('. ')}</p> : null;
}

function resultHeadline(sale: Sale, userId: string) {
  if (!sale.player_id) return 'No sale';
  if (sale.player_id === userId) return 'Yours!';
  return sale.amount > 0 ? 'Sold' : 'Given away';
}

function resultLine(sale: Sale, userId: string, nameFor: (id: string) => string) {
  if (!sale.player_id) return 'Nobody bid on it.';
  if (sale.player_id === userId) {
    return sale.amount > 0 ? `You won it for ${sale.amount}.` : 'It’s yours, free.';
  }
  const name = nameFor(sale.player_id);
  return sale.amount > 0 ? `${name} won it for ${sale.amount}.` : `${name} got it free.`;
}

// Everyone's money left, most first: who can still afford the good stuff.
function Board({ players, userId }: { players: Player[]; userId: string }) {
  const ranked = [...players].sort((a, b) => b.money_left - a.money_left);
  return (
    <section aria-labelledby="board-heading" className="flex flex-col gap-4">
      <h2 id="board-heading" className="font-display text-3xl leading-none">
        Money left
      </h2>
      <ol className="flex flex-col divide-y divide-cream/10 border-y border-cream/10">
        {ranked.map((player) => (
          <li
            key={player.player_id}
            className={`flex items-center gap-3 py-2.5 ${
              player.player_id === userId ? 'font-semibold' : ''
            }`}
          >
            <Avatar url={player.avatar_url} name={player.name} size={28} />
            <span className="min-w-0 flex-1 truncate">
              {player.name}
              {player.player_id === userId && ' (you)'}
            </span>
            <span className="text-sm font-normal text-cream/60">{player.lots_won} won</span>
            <span className="w-10 text-right tabular-nums">{player.money_left}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function YourLots({ sales, lotOf }: { sales: Sale[]; lotOf: Map<number, Lot> }) {
  return (
    <section aria-labelledby="yours-heading" className="flex flex-col gap-4">
      <h2 id="yours-heading" className="font-display text-3xl leading-none">
        Your lots
      </h2>
      {sales.length > 0 ? (
        <ol className="flex flex-col divide-y divide-cream/10 border-y border-cream/10">
          {sales.map((sale) => {
            const lot = lotOf.get(sale.item_id);
            return (
              <li key={sale.item_id} className="flex items-baseline gap-3 py-2.5">
                <span className="min-w-0 flex-1 truncate">
                  {lot ? `Lot ${lot.lot_number}: ${lot.title}` : 'A lot'}
                </span>
                <span className="text-sm text-cream/60 tabular-nums">
                  {sale.amount > 0 ? `for ${sale.amount}` : 'free'}
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-cream/70">Nothing yet.</p>
      )}
    </section>
  );
}

async function NotLive({
  db,
  games,
  userId,
}: {
  db: SupabaseClient;
  games: Game[];
  userId: string;
}) {
  const { data } = await db.from('game_players').select('game_id, budget').eq('player_id', userId);
  const budgetIn = new Map(
    (data ?? []).map((row) => [row.game_id as number, row.budget as number]),
  );
  // Games come newest first, so the first one says whether the auction is over.
  const over = games[0]?.ended_at ? games[0] : undefined;
  const upcoming = games.find((game) => !game.started_at && budgetIn.has(game.id));
  const [lots, sales] =
    over && budgetIn.has(over.id)
      ? await Promise.all([getLots(db), getSales(db, over.id)])
      : [[], []];

  return (
    <>
      <Header />
      <section aria-labelledby="status-heading" className="flex flex-col items-start gap-8">
        <h1 id="status-heading" className="font-display text-6xl leading-none md:text-8xl">
          {over ? 'That’s a wrap' : 'Not live yet'}
        </h1>
        {over ? (
          <p className="text-xl">The auction is over. Thanks for playing.</p>
        ) : (
          <>
            <p className="max-w-xl text-xl">
              {upcoming
                ? `You’re in. You’ll start with ${budgetIn.get(upcoming.id)} to spend.`
                : `Bidding opens ${AUCTION_WHEN}.`}
            </p>
            <Countdown
              target={AUCTION_START}
              done={
                <p className="text-cream/70">
                  The host will start any minute. This page updates on its own.
                </p>
              }
            />
          </>
        )}
        <Link href="/catalog" className="underline underline-offset-4">
          Browse the catalog
        </Link>
      </section>
      {over && budgetIn.has(over.id) && (
        <YourLots
          sales={sales.filter((sale) => sale.player_id === userId)}
          lotOf={new Map(lots.map((lot) => [lot.id, lot]))}
        />
      )}
    </>
  );
}
