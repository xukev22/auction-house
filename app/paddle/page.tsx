import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { signOut } from '@/utils/supabase/signout';

// Signed-in only: proxy.ts already redirects signed-out visitors, and this page checks again
// on the server so it never renders without a user.
export default async function PaddlePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const fullName = (user.user_metadata.full_name as string | undefined) ?? user.email ?? 'Bidder';
  const firstName = fullName.split(' ')[0];
  // Google serves a 96px avatar by default (…=s96-c); ask for a sharper one.
  const avatarUrl = (user.user_metadata.avatar_url as string | undefined)?.replace(
    /=s\d+-c$/,
    '=s256-c',
  );

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-12">
      <h1 className="sr-only">Your paddle</h1>

      <div aria-hidden className="flex flex-col items-center">
        <div className="flex size-64 flex-col items-center justify-center gap-3 rounded-full bg-bone p-6 text-claret shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] md:size-80">
          {avatarUrl && (
            <Image
              src={avatarUrl}
              alt=""
              width={112}
              height={112}
              className="size-20 rounded-full ring-4 ring-claret md:size-28"
            />
          )}
          <span className="font-display text-[clamp(2.5rem,12vw,4.5rem)] leading-none break-all text-center">
            {firstName}
          </span>
        </div>
        <div className="h-36 w-7 rounded-b-lg bg-bone/85" />
      </div>

      <div className="flex max-w-md flex-col items-center gap-2 text-center">
        <p className="text-xl">This is your paddle, {firstName}. Hold it up when bidding opens.</p>
        <p className="text-bone/70">Signed in with Google as {user.email}</p>
      </div>

      <div className="flex items-center gap-6">
        <Link href="/" className="underline underline-offset-4">
          Back to the countdown
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="text-bone/70 underline underline-offset-4 hover:text-bone"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
