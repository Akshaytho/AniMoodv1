import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AniMood — Find stories that understand you',
    template: '%s · AniMood',
  },
  description:
    'Discover anime, manga, and manhwa by mood and emotional theme. Curated emotional discovery for fans.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://animood.app'),
  openGraph: {
    type: 'website',
    siteName: 'AniMood',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="bg-bg text-text font-sans antialiased">{children}</body>
    </html>
  );
}
