import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AUCTION_WHEN } from '@/lib/event';

export const metadata: Metadata = { title: 'Catalog' };

// When each block starts its un-blur (globals.css), top to bottom.
const delay = (ms: number) => ({ '--unblur-delay': `${ms}ms` }) as CSSProperties;

// Placeholder lots until the items table exists. Swap these for real rows later.
const PLACEHOLDER_LOTS = 8;

export default function CatalogPage() {
  return (
    <main className="flex flex-1 flex-col gap-14 px-4 py-8 sm:px-8 md:gap-20 md:px-14 md:py-12">
      <header className="unblur-line flex items-baseline justify-between gap-4" style={delay(0)}>
        <Link href="/" className="font-display text-xl leading-none md:text-2xl">
          Sonu Auction House
        </Link>
        <p className="hidden text-sm text-cream/70 sm:block">{AUCTION_WHEN}</p>
      </header>

      <div className="flex flex-col gap-5">
        {/* "EVERYTHING" fills the width without overflowing: ~5.6em wide in Rozha One caps. */}
        <h1 className="font-display text-[min(15.5vw,14rem)] leading-[0.86] tracking-[-0.01em]">
          <span className="unblur-line block" style={delay(150)}>
            EVERYTHING
          </span>
          <span className="unblur-line block" style={delay(300)}>
            MUST GO
          </span>
        </h1>
        <p
          className="unblur-line text-2xl font-extralight tracking-wide md:text-4xl"
          style={delay(550)}
        >
          (EVERYTHING IS FREE)
        </p>
        <p className="unblur-line max-w-xl text-cream/70" style={delay(700)}>
          The lots are still being photographed. They&rsquo;ll show up here before bidding opens{' '}
          {AUCTION_WHEN}.
        </p>
      </div>

      <section aria-label="Lots" aria-busy="true" className="unblur-line" style={delay(850)}>
        <ol
          aria-hidden
          className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 md:gap-y-12 xl:grid-cols-4"
        >
          {Array.from({ length: PLACEHOLDER_LOTS }, (_, i) => (
            <li key={i} className="flex flex-col gap-3">
              <div className="skeleton aspect-[4/5] w-full rounded-sm" />
              <p className="font-display text-lg leading-none md:text-xl">Lot {i + 1}</p>
              <div className="skeleton h-4 w-3/4 rounded-full" />
              <div className="skeleton h-4 w-1/3 rounded-full" />
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
