import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

// The host is whoever signs in with ADMIN_EMAIL (.env.local and Vercel). Unset means nobody.
export function isHostEmail(email: string | null | undefined) {
  const hostEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(email && hostEmail && email.toLowerCase() === hostEmail);
}

// The signed-in host, checked against Supabase, or null. Use this to guard host actions.
export async function getHost() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user && isHostEmail(user.email) ? user : null;
}

// Uses the secret key, which skips every access rule. Only use it after getHost() says yes.
export function createHostClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
