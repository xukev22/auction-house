'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/utils/supabase/browser';

// How far each quick button goes over the high bid.
const STEPS = [1, 5, 10];

const button = 'flex flex-col items-center rounded-xl py-2.5 transition-colors disabled:opacity-35';

// The bid bar pinned to the bottom of the screen. Each button shows the exact amount it bids.
// Bids go straight to place_bid (supabase/game.sql) as whoever is signed in, which checks the
// rules again: a bid that beats the high bid, from someone in the game who can afford it.
export function BidControls({
  highBid,
  moneyLeft,
  youreHigh,
}: {
  highBid: number;
  moneyLeft: number;
  youreHigh: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const bid = (amount: number) => {
    setError(undefined);
    startTransition(async () => {
      const { error } = await createBrowserSupabaseClient().rpc('place_bid', {
        p_amount: amount,
      });
      if (error) setError(error.message);
      router.refresh();
    });
  };

  const status = pending
    ? 'Placing your bid…'
    : youreHigh
      ? `You're the high bidder at ${highBid}.`
      : moneyLeft <= highBid
        ? `You can't beat ${highBid} with ${moneyLeft} left.`
        : 'Tap a number to bid it.';

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-cream/15 bg-night/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <p aria-live="polite" className={youreHigh ? 'text-teal' : 'text-cream/70'}>
            {status}
          </p>
          <p className="shrink-0 text-cream/70">
            You have <span className="text-cream tabular-nums">{moneyLeft}</span>
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((step) => {
            const amount = highBid + step;
            return (
              <button
                key={step}
                type="button"
                disabled={pending || youreHigh || amount > moneyLeft}
                onClick={() => bid(amount)}
                aria-label={`Bid ${amount}`}
                className={`${button} bg-cream text-night hover:bg-white`}
              >
                <span className="text-lg font-semibold tabular-nums">{amount}</span>
                <span className="text-xs text-night/65">+{step}</span>
              </button>
            );
          })}
          <button
            type="button"
            disabled={pending || youreHigh || moneyLeft <= highBid}
            onClick={() => {
              if (window.confirm(`Bid all ${moneyLeft} you have left?`)) bid(moneyLeft);
            }}
            aria-label={`Bid everything you have left, ${moneyLeft}`}
            className={`${button} border border-cream/40 hover:border-cream`}
          >
            <span className="text-lg font-semibold tabular-nums">{moneyLeft}</span>
            <span className="text-xs text-cream/70">All in</span>
          </button>
        </div>

        {error && (
          <p role="alert" className="text-sm text-[#ffab9c]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
