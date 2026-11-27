'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/utils/supabase/browser';

// The auction tables phones listen to (supabase/game.sql turns live updates on for them).
const TABLES = ['games', 'game_players', 'bids', 'sales'];

// Reloads the page's data whenever the auction changes, and whenever the phone comes back
// to the page (a locked phone misses updates while it's away). Renders nothing.
export function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let timer: ReturnType<typeof setTimeout> | undefined;
    // One action can change several rows at once (a sale also clears the lot), so wait a
    // moment and reload once.
    const reload = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 150);
    };

    const channel = supabase.channel('auction');
    for (const table of TABLES) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, reload);
    }
    let connectedBefore = false;
    channel.subscribe((status) => {
      if (status !== 'SUBSCRIBED') return;
      // After a dropped connection comes back, catch up on anything missed.
      if (connectedBefore) reload();
      connectedBefore = true;
    });

    const onVisible = () => {
      if (document.visibilityState === 'visible') reload();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
