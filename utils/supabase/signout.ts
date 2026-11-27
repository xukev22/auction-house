'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

// Signs out this browser only. Supabase's default ('global') would also sign the same account
// out on every other phone and laptop.
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: 'local' });
  redirect('/auth/login');
}
