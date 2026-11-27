'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Live needs sign-in, so signed-out visitors land on the login page first (proxy.ts).
const LINKS = [
  { href: '/live', label: 'Live' },
  { href: '/catalog', label: 'Catalog' },
];
const HOST_LINK = { href: '/host', label: 'Host' };

export function NavLinks({ isHost }: { isHost: boolean }) {
  const pathname = usePathname();
  const links = isHost ? [...LINKS, HOST_LINK] : LINKS;
  // The landing page's giant name is the brand there, and its glow runs to the top edge, so
  // the nav floats over it with just the links.
  const onLanding = pathname === '/';

  return (
    <nav
      aria-label="Main"
      className={`flex items-center gap-4 px-4 pt-5 sm:px-8 md:px-14 md:pt-7 ${
        onLanding ? 'absolute inset-x-0 top-0 z-20 justify-end' : 'justify-between'
      }`}
    >
      {!onLanding && (
        <Link href="/" className="font-display text-lg leading-none md:text-2xl">
          Sonu Auction House
        </Link>
      )}
      <ul className="flex items-center gap-5 text-sm md:gap-8 md:text-base">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={
                pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined
              }
              className="text-cream/70 underline-offset-[6px] transition-colors hover:text-cream aria-[current=page]:text-cream aria-[current=page]:underline"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
