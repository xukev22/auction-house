import { isHostEmail } from '@/utils/host';
import { createClient } from '@/utils/supabase/server';
import { NavLinks } from './NavLinks';

// The nav on every page. Host only shows for the host; it's display only, since /host and its
// actions check again for themselves.
export async function SiteNav() {
  const supabase = await createClient();
  // getClaims reads the sign-in token without a round trip to Supabase, which keeps every page
  // load quick.
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;

  return <NavLinks isHost={isHostEmail(email)} />;
}
