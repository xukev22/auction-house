import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, Rozha_One } from 'next/font/google';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/event';
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
  title: SITE_NAME,
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
    <html lang="en" className={`${rozha.variable} ${hanken.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
