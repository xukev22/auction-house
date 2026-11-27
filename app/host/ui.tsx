import type { ReactNode } from 'react';
import Image from 'next/image';

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

// A Google profile photo, or the first letter of their name when there isn't one.
export function Avatar({
  url,
  name,
  size = 32,
}: {
  url: string | null;
  name: string;
  size?: number;
}) {
  return url ? (
    <Image
      src={url}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-violet/40 text-sm"
      style={{ width: size, height: size }}
    >
      {name.charAt(0)}
    </span>
  );
}
