import Link from 'next/link';
import { ActionButton } from './ActionButton';
import { ActionForm } from './ActionForm';
import { addPlayers, createGame, removePlayer, setBudget, startGame } from './actions';
import { getAccounts, getRoster, type Game } from './data';
import { Avatar, field } from './ui';

const statusLabel = (game: Game) =>
  game.ended_at ? 'Over' : game.started_at ? 'Live' : 'Setting up';

// When no game is live: the list of games, a form for a new one, and the chosen game's players.
export function GameSetup({ games, selectedId }: { games: Game[]; selectedId: number | null }) {
  const selected = games.find((game) => game.id === selectedId);

  return (
    <div className="grid gap-14 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-20">
      <section aria-labelledby="games-heading" className="flex flex-col gap-6">
        <h1 id="games-heading" className="font-display text-4xl leading-none md:text-5xl">
          Games
        </h1>
        {games.length > 0 ? (
          <ul className="flex flex-col divide-y divide-cream/10 border-y border-cream/10">
            {games.map((game) => (
              <li key={game.id}>
                <Link
                  href={`/host?game=${game.id}`}
                  aria-current={game.id === selected?.id ? 'page' : undefined}
                  className="flex items-baseline justify-between gap-4 py-3 text-cream/80 hover:text-cream aria-[current=page]:font-semibold aria-[current=page]:text-cream"
                >
                  <span>{game.name}</span>
                  <span className="text-sm font-normal text-cream/60">{statusLabel(game)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-cream/70">No games yet. Make a test run first, then the real one.</p>
        )}

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">New game</h2>
          <ActionForm
            action={createGame}
            submitLabel="Create game"
            className="flex flex-col gap-3 [&>button]:self-start"
          >
            <label className="flex flex-col gap-1 text-sm text-cream/70">
              Name
              <input name="name" required placeholder="Test run" className={field} />
            </label>
            <label className="flex flex-col gap-1 text-sm text-cream/70">
              Starting budget for each player
              <input
                name="budget"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={100}
                required
                className={field}
              />
            </label>
          </ActionForm>
        </div>
      </section>

      {selected ? (
        <SelectedGame key={selected.id} game={selected} />
      ) : (
        games.length > 0 && <p className="text-cream/70">Pick a game to set it up.</p>
      )}
    </div>
  );
}

async function SelectedGame({ game }: { game: Game }) {
  const [players, accounts] = await Promise.all([getRoster(game.id), getAccounts()]);
  const playing = new Set(players.map((player) => player.player_id));
  const notPlaying = accounts.filter((account) => !playing.has(account.id));
  const over = Boolean(game.ended_at);

  return (
    <section aria-labelledby="game-heading" className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <h2 id="game-heading" className="font-display text-4xl leading-none md:text-5xl">
          {game.name}
        </h2>
        <p className="text-cream/70">
          {over
            ? 'This game is over.'
            : `Setting up. Each player starts with ${game.starting_budget}.`}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Players ({players.length})</h3>
        {players.length > 0 ? (
          <ul className="flex flex-col divide-y divide-cream/10 border-y border-cream/10">
            {players.map((player) => (
              <li
                key={player.player_id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3"
              >
                <div className="flex min-w-40 flex-1 items-center gap-3">
                  <Avatar url={player.avatar_url} name={player.name} />
                  <span>{player.name}</span>
                </div>
                {over ? (
                  <p className="text-sm text-cream/70">
                    Won {player.lots_won} for {player.spent}, {player.money_left} left
                  </p>
                ) : (
                  <>
                    <ActionForm
                      action={setBudget.bind(null, game.id, player.player_id)}
                      submitLabel="Save"
                    >
                      <label className="flex items-center gap-2 text-sm text-cream/70">
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
                    <ActionButton action={removePlayer.bind(null, game.id, player.player_id)}>
                      Remove
                    </ActionButton>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-cream/70">Nobody is in this game yet. Add people below.</p>
        )}
      </div>

      {!over && (
        <>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Add players</h3>
            {notPlaying.length > 0 ? (
              <ActionForm
                action={addPlayers.bind(null, game.id)}
                submitLabel="Add to game"
                className="flex flex-col gap-4 [&>button]:self-start"
              >
                <fieldset className="flex flex-col divide-y divide-cream/10 border-y border-cream/10">
                  <legend className="sr-only">People who have signed in</legend>
                  {notPlaying.map((account) => (
                    <label key={account.id} className="flex cursor-pointer items-center gap-3 py-3">
                      <input
                        type="checkbox"
                        name="player"
                        value={account.id}
                        className="size-4 accent-cream"
                      />
                      <Avatar url={account.avatarUrl} name={account.name} />
                      <span className="flex min-w-0 flex-col">
                        <span>{account.name}</span>
                        <span className="truncate text-sm text-cream/60">{account.email}</span>
                      </span>
                    </label>
                  ))}
                </fieldset>
              </ActionForm>
            ) : (
              <p className="text-cream/70">Everyone who has signed in is already in this game.</p>
            )}
            <p className="text-sm text-cream/60">
              Only people who have signed in to the site at least once show up here.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-cream/15 pt-8">
            <ActionButton
              primary
              disabled={players.length === 0}
              action={startGame.bind(null, game.id)}
              confirm={`Start ${game.name}? Players can bid as soon as you put a lot up.`}
            >
              Start the game
            </ActionButton>
            <p className="text-sm text-cream/60">
              You can still add players and change budgets once it&rsquo;s live.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
