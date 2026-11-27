import type { ReactNode } from 'react';

export { Avatar } from '@/app/Avatar';

// Shared looks for the host page's buttons, fields and messages.
export const primaryButton =
  'rounded-full bg-cream px-5 py-2.5 font-semibold text-night transition-colors hover:bg-white disabled:opacity-50';
export const secondaryButton =
  'rounded-full border border-cream/30 px-4 py-2 transition-colors hover:border-cream/70 disabled:opacity-40 disabled:hover:border-cream/30';
export const field =
  'rounded-md border border-cream/25 bg-night px-3 py-2 text-cream placeholder:text-cream/40';

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-sm text-[#ffab9c]">
      {children}
    </p>
  );
}
