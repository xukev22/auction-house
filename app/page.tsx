import type { CSSProperties } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signOut } from '@/utils/supabase/signout';
import { GoogleButton } from '@/app/auth/login/GoogleButton';
import { AUCTION_START, AUCTION_WHEN } from '@/lib/event';
import { Backdrop } from './Backdrop';
import { Countdown } from './Countdown';

// When each block starts its un-blur (globals.css), top to bottom.
const delay = (ms: number) => ({ '--unblur-delay': `${ms}ms` }) as CSSProperties;

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const firstName = (user?.user_metadata.full_name as string | undefined)?.split(' ')[0];

  return (
    <main className="relative isolate flex flex-1 flex-col justify-between gap-16 overflow-hidden bg-[radial-gradient(ellipse_at_15%_0%,#2f1150_0%,transparent_55%)] px-4 py-10 sm:px-8 md:px-14 md:py-14 lg:flex-row lg:items-end">
      <Backdrop />

      {/* Phones/tablets: the name fills the width. Wide screens: name top-left, details bottom-right. */}
      <h1 className="relative font-display text-[min(22vw,14rem)] leading-[0.82] tracking-[-0.02em] drop-shadow-[0_4px_24px_rgba(22,10,34,0.7)] lg:self-start lg:text-[min(12vw,14rem)]">
        <span className="unblur-line block" style={delay(200)}>
          Sonu
        </span>
        <span className="unblur-line block" style={delay(350)}>
          Auction
        </span>
        <span className="unblur-line block" style={delay(500)}>
          House
        </span>
      </h1>

      <div className="relative flex flex-col gap-10 [text-shadow:0_1px_14px_rgba(22,10,34,0.9)] lg:max-w-xl">
        <div className="flex max-w-xl flex-col gap-2">
          <p className="unblur-line text-xl leading-snug md:text-2xl" style={delay(800)}>
            The first lot goes under the hammer {AUCTION_WHEN}.
          </p>
          <p className="unblur-line text-cream/70" style={delay(900)}>
            Date and time are tentative.
          </p>
        </div>

        <div className="unblur-line" style={delay(1000)}>
          <Countdown target={AUCTION_START} />
        </div>

        <div
          className="unblur-line flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-cream/20 pt-6"
          style={delay(1100)}
        >
          {user ? (
            <>
              <p>You&rsquo;re signed in{firstName ? ` as ${firstName}` : ''}. See you there.</p>
              <Link href="/paddle" className="underline underline-offset-4">
                See your paddle
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-cream/70 underline underline-offset-4 hover:text-cream"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <GoogleButton />
              <p className="text-cream/70">Sign in ahead of time so you&rsquo;re ready to bid.</p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
