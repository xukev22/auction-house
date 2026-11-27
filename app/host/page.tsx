import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LiveRefresh } from '@/app/LiveRefresh';
import { getHost } from '@/utils/host';
import { getGames } from './data';
import { GameSetup } from './GameSetup';
import { LiveConsole } from './LiveConsole';

export const metadata: Metadata = { title: 'Host' };

// Host controls: only ADMIN_EMAIL gets past the first line (everyone else sees a 404).
export default async function HostPage({ searchParams }: PageProps<'/host'>) {
  if (!(await getHost())) notFound();

  const { game } = await searchParams;
  const games = await getGames();
  const live = games.find((g) => g.started_at && !g.ended_at);

  return (
    <main className="flex flex-1 flex-col gap-12 px-4 py-8 sm:px-8 md:gap-16 md:px-14 md:py-12">
      <LiveRefresh />
      <header className="flex items-baseline justify-between gap-4">
        <Link href="/" className="font-display text-xl leading-none md:text-2xl">
          Sonu Auction House
        </Link>
        <p className="text-sm text-cream/70">Host controls</p>
      </header>

      {live ? (
        <LiveConsole game={live} />
      ) : (
        <GameSetup games={games} selectedId={Number(game) || null} />
      )}
    </main>
  );
}
