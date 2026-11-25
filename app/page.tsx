import { createClient } from '@/utils/supabase/server';
import { signOut } from '@/utils/supabase/signout';

// Placeholder: proves the Google sign-in round trip works.
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Auction House</h1>
      <p>
        Signed in as <strong>{user?.user_metadata.full_name ?? user?.email}</strong>
      </p>
      <form action={signOut}>
        <button type="submit" className="rounded-md border border-current px-4 py-2">
          Sign out
        </button>
      </form>
    </main>
  );
}
