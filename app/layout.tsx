import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, Rozha_One } from 'next/font/google';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/event';
import { SiteNav } from './SiteNav';
import './globals.css';

const rozha = Rozha_One({
  variable: '--font-rozha',
  weight: '400',
  subsets: ['latin'],
});

const hanken = Hanken_Grotesk({
  variable: '--font-hanken',
  subsets: ['latin'],
});

// og:image (and the twitter:image fallback) comes from opengraph-image.tsx, and the
// favicon from favicon.ico, both in this folder.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages can set just their own name, e.g. "Catalog" -> "Catalog | Sonu Auction House".
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

// Tints the browser toolbar on phones to match the page.
export const viewport: Viewport = { themeColor: '#160a22' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // suppressHydrationWarning: the script below adds a class to <html> before React hydrates.
    <html
      lang="en"
      className={`${rozha.variable} ${hanken.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Turns on the page-load fade (globals.css) only when JS runs, so nothing stays hidden without it. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js-ready')" }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
