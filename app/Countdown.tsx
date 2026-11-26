'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

// Whole seconds, so the snapshot stays stable between renders within the same tick.
const nowInSeconds = () => Math.floor(Date.now() / 1000);
// Unknown on the server; the client fills it in after hydration.
const noTimeOnServer = () => null;

const pad = (n: number) => String(n).padStart(2, '0');

export function Countdown({ target }: { target: Date }) {
  const now = useSyncExternalStore(subscribe, nowInSeconds, noTimeOnServer);

  const remaining = now === null ? null : Math.max(0, target.getTime() / 1000 - now);

  if (remaining === 0) {
    return <p className="text-3xl font-light md:text-5xl">Bidding is open.</p>;
  }

  const units: [string, number | null][] = [
    ['days', remaining === null ? null : Math.floor(remaining / 86400)],
    ['hours', remaining === null ? null : Math.floor(remaining / 3600) % 24],
    ['minutes', remaining === null ? null : Math.floor(remaining / 60) % 60],
    ['seconds', remaining === null ? null : remaining % 60],
  ];

  return (
    <div role="timer" aria-label="Time until bidding opens" className="flex gap-6 md:gap-10">
      {units.map(([label, value]) => (
        <div key={label} className="flex flex-col">
          <span className="text-5xl font-extralight tabular-nums md:text-7xl lg:text-6xl xl:text-7xl">
            {value === null ? '––' : pad(value)}
          </span>
          <span className="mt-1 text-sm text-cream/70">{label}</span>
        </div>
      ))}
    </div>
  );
}
