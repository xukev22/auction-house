import Image from 'next/image';
import { ActionButton } from './ActionButton';
import { ActionForm } from './ActionForm';
import {
  addPlayers,
  callStage,
  endGame,
  giveLot,
  noSale,
  reopenLot,
  sell,
  setBudget,
  startLot,
  undoLastBid,
} from './actions';
import {
  firstName,
  getAccounts,
  getBids,
  getLots,
  getRoster,
  getSales,
  photoUrl,
  type Game,
  type Sale,
} from './data';
import { Avatar, field } from './ui';

const STAGES = [
  { stage: 'going once', label: 'Going once' },
  { stage: 'going twice', label: 'Going twice' },
  { stage: 'bidding', label: 'Back to bidding' },
] as const;

const STAGE_HEADLINE = {
  bidding: 'Bidding is open',
  'going once': 'Going once',
  'going twice': 'Going twice',
};

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

// The live game: the lot that's up with every control for it, all the lots, and the players.
export async function LiveConsole({ game }: { game: Game }) {
  const [players, lots, sales, accounts] = await Promise.all([
    getRoster(game.id),
    getLots(),
    getSales(game.id),
    getAccounts(),
  ]);
  const current = lots.find((lot) => lot.id === game.current_item_id);
  const bids = current ? await getBids(game.id, current.id) : [];

  const nameOf = new Map(players.map((player) => [player.player_id, player.name]));
  const saleOf = new Map(sales.map((sale) => [sale.item_id, sale]));
  // Bids only go up, so the newest bid is the high bid.
  const top = bids[0];
  const nextLot = lots.find((lot) => !saleOf.has(lot.id) && lot.id !== current?.id);
  const lotUp = Boolean(current);
  const playing = new Set(players.map((player) => player.player_id));
  const notPlaying = accounts.filter((account) => !playing.has(account.id));

  const outcome = (sale: Sale) => {
    if (!sale.player_id) return 'No sale';
    const name = nameOf.get(sale.player_id) ?? 'someone';
    return sale.amount > 0 ? `Sold to ${name} for ${sale.amount}` : `Given to ${name}`;
  };

  return (
    <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-20">
      <div className="flex flex-col gap-14">
        <section aria-labelledby="game-heading" className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between gap-4">
            <h1 id="game-heading" className="font-display text-4xl leading-none md:text-5xl">
              {game.name}
            </h1>
            <p className="text-sm text-teal">Live</p>
          </div>

          {current && game.stage ? (
            <div className="flex flex-col gap-6 rounded-sm border border-cream/15 p-5 md:p-7">
              <div className="flex items-center gap-4">
                {current.image_paths[0] && (
                  <Image
                    src={photoUrl(current.image_paths[0])}
                    alt=""
                    width={72}
                    height={90}
                    className="aspect-[4/5] w-18 shrink-0 rounded-sm object-cover"
                  />
                )}
                <div>
                  <p className="font-display text-xl leading-none">Lot {current.lot_number}</p>
                  <p className="mt-1.5">{current.title}</p>
                </div>
              </div>

              <div aria-live="polite">
                <p className="font-display text-5xl leading-none md:text-6xl">
                  {STAGE_HEADLINE[game.stage]}
                </p>
                <p className="mt-3 text-xl">
                  {top ? (
                    <>
                      High bid <span className="tabular-nums">{top.amount}</span> from{' '}
                      {nameOf.get(top.player_id)}
                    </>
                  ) : (
                    'No bids yet'
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {STAGES.map(({ stage, label }) => (
                  <ActionButton
                    key={stage}
                    action={callStage.bind(null, stage)}
                    disabled={game.stage === stage}
                  >
                    {label}
                  </ActionButton>
                ))}
              </div>

              <div className="flex flex-wrap items-start gap-2 border-t border-cream/15 pt-6">
                {top ? (
                  <>
                    <ActionButton primary action={sell}>
                      Sold to {firstName(nameOf.get(top.player_id) ?? 'them')} for {top.amount}
                    </ActionButton>
                    <ActionButton action={undoLastBid}>Undo last bid</ActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton action={noSale}>No sale</ActionButton>
                    <ActionForm action={giveLot} submitLabel="Give it free">
                      <label className="sr-only" htmlFor="give-to">
                        Give this lot free to
                      </label>
                      <select id="give-to" name="player" defaultValue="" className={field}>
                        <option value="" disabled>
                          Pity win for&hellip;
                        </option>
                        {players.map((player) => (
                          <option key={player.player_id} value={player.player_id}>
                            {player.name} ({player.lots_won} won)
                          </option>
                        ))}
                      </select>
                    </ActionForm>
                  </>
                )}
              </div>

              {bids.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h2 className="text-sm text-cream/70">Bids, newest first</h2>
                  <ol className="flex flex-col divide-y divide-cream/10 text-sm">
                    {bids.map((bid) => (
                      <li key={bid.id} className="flex items-baseline gap-4 py-2">
                        <span className="flex-1">{nameOf.get(bid.player_id)}</span>
                        <span className="tabular-nums">{bid.amount}</span>
                        <span className="w-24 text-right text-cream/60 tabular-nums">
                          {timeOf(bid.created_at)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-sm border border-cream/15 p-5 md:p-7">
              <p className="text-cream/70">No lot is up.</p>
              {nextLot ? (
                <ActionButton primary action={startLot.bind(null, nextLot.id)}>
                  Put up Lot {nextLot.lot_number}: {nextLot.title}
                </ActionButton>
              ) : (
                <p>Every lot is closed. End the game when you&rsquo;re ready.</p>
              )}
            </div>
          )}
        </section>

        <section aria-labelledby="lots-heading" className="flex flex-col gap-4">
          <h2 id="lots-heading" className="font-display text-3xl leading-none">
            Lots
          </h2>
          {lotUp && (
            <p className="text-sm text-cream/60">
              Close the lot that&rsquo;s up to start or reopen others.
            </p>
          )}
          <ol className="flex flex-col divide-y divide-cream/10 border-y border-cream/10">
            {lots.map((lot) => {
              const sale = saleOf.get(lot.id);
              const isUp = lot.id === current?.id;
              return (
                <li key={lot.id} className="flex items-center gap-3 py-2.5">
                  {lot.image_paths[0] && (
                    <Image
                      src={photoUrl(lot.image_paths[0])}
                      alt=""
                      width={40}
                      height={50}
                      className="aspect-[4/5] w-10 shrink-0 rounded-sm object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate">
                      <span className="font-display">Lot {lot.lot_number}</span> {lot.title}
                    </p>
                    <p className={`text-sm ${isUp ? 'text-teal' : 'text-cream/60'}`}>
                      {isUp ? 'Up now' : sale ? outcome(sale) : 'Not up yet'}
                    </p>
                  </div>
                  {!lotUp &&
                    (sale ? (
                      <ActionButton action={reopenLot.bind(null, lot.id)}>Reopen</ActionButton>
                    ) : (
                      <ActionButton action={startLot.bind(null, lot.id)}>Put up</ActionButton>
                    ))}
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <aside aria-labelledby="players-heading" className="flex flex-col gap-6">
        <h2 id="players-heading" className="font-display text-3xl leading-none">
          Players
        </h2>
        <ul className="flex flex-col divide-y divide-cream/10 border-y border-cream/10">
          {players.map((player) => (
            <li key={player.player_id} className="flex flex-col gap-2 py-3">
              <div className="flex items-center gap-3">
                <Avatar url={player.avatar_url} name={player.name} />
                <span className="min-w-0 flex-1 truncate">{player.name}</span>
                <span className="tabular-nums">{player.money_left} left</span>
              </div>
              <details className="text-sm text-cream/70">
                <summary className="cursor-pointer">
                  {player.lots_won} {player.lots_won === 1 ? 'lot' : 'lots'} won, budget{' '}
                  {player.budget}
                </summary>
                <div className="pt-3">
                  <ActionForm
                    action={setBudget.bind(null, game.id, player.player_id)}
                    submitLabel="Save"
                  >
                    <label className="flex items-center gap-2">
                      Budget
                      <input
                        name="budget"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        defaultValue={player.budget}
                        required
                        className={`${field} w-24`}
                      />
                    </label>
                  </ActionForm>
                </div>
              </details>
            </li>
          ))}
        </ul>

        {notPlaying.length > 0 && (
          <details className="text-sm">
            <summary className="cursor-pointer text-cream/70">
              Add someone who showed up late
            </summary>
            <div className="pt-3">
              <ActionForm action={addPlayers.bind(null, game.id)} submitLabel="Add to game">
                <label className="sr-only" htmlFor="late-player">
                  Person to add
                </label>
                <select id="late-player" name="player" defaultValue="" className={field}>
                  <option value="" disabled>
                    Pick someone&hellip;
                  </option>
                  {notPlaying.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </ActionForm>
            </div>
          </details>
        )}

        <div className="border-t border-cream/15 pt-6">
          <ActionButton
            action={endGame}
            disabled={lotUp}
            confirm={`End ${game.name}? Nobody can bid after this, and it can't be restarted.`}
          >
            End the game
          </ActionButton>
        </div>
      </aside>
    </div>
  );
}
