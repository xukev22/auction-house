'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/utils/supabase/browser';

export function GoogleButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    const { error } = await createBrowserSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Must exactly match an entry in Supabase -> Auth -> URL Configuration -> Redirect URLs.
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    });

    // On success the browser is already navigating to Google.
    if (error) {
      console.error('OAuth error:', error.message);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading}
      className="rounded-md border border-current px-4 py-2 disabled:opacity-50"
    >
      {loading ? 'Redirecting…' : 'Continue with Google'}
    </button>
  );
}
