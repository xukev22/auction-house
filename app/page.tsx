import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signOut } from '@/utils/supabase/signout';
import { GoogleButton } from '@/app/auth/login/GoogleButton';
import { AUCTION_START, AUCTION_WHEN } from '@/lib/event';
import { Countdown } from './Countdown';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const firstName = (user?.user_metadata.full_name as string | undefined)?.split(' ')[0];

  return (
    <main className="room-jolt flex flex-1 flex-col justify-between gap-16 bg-[radial-gradient(ellipse_at_20%_0%,#7a1c33_0%,transparent_60%)] px-4 py-10 sm:px-8 md:px-14 md:py-14 lg:flex-row lg:items-end">
      {/* Phones/tablets: the name fills the width. Wide screens: name top-left, details bottom-right. */}
      <h1 className="gavel-drop font-display text-[min(22vw,14rem)] leading-[0.82] tracking-[-0.02em] lg:self-start lg:text-[min(12vw,14rem)]">
        Sonu
        <br />
        Auction
        <br />
        House
      </h1>

      <div className="settle-in flex flex-col gap-10 lg:max-w-xl">
        <div className="flex max-w-xl flex-col gap-2">
          <p className="text-xl leading-snug md:text-2xl">
            The first lot goes under the hammer {AUCTION_WHEN}.
          </p>
          <p className="text-bone/70">Date and time are tentative.</p>
        </div>

        <Countdown target={AUCTION_START} />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-bone/20 pt-6">
          {user ? (
            <>
              <p>You&rsquo;re signed in{firstName ? ` as ${firstName}` : ''}. See you there.</p>
              <Link href="/paddle" className="underline underline-offset-4">
                See your paddle
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-bone/70 underline underline-offset-4 hover:text-bone"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <GoogleButton />
              <p className="text-bone/70">Sign in ahead of time so you&rsquo;re ready to bid.</p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
