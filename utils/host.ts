import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

// The host is whoever signs in with ADMIN_EMAIL (.env.local and Vercel). Unset means nobody.
export async function getHost() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hostEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!user?.email || !hostEmail || user.email.toLowerCase() !== hostEmail) return null;
  return user;
}

// Uses the secret key, which skips every access rule. Only use it after getHost() says yes.
export function createHostClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
