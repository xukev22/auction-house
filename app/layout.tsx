import type { Metadata } from 'next';
import { Hanken_Grotesk, Rozha_One } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Sonu Auction House',
  description: 'The first lot goes under the hammer Sunday, November 29 at 8 pm ET.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${rozha.variable} ${hanken.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
