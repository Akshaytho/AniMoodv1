import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AniMood Dashboard',
  description: 'Review mappings and page drafts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text font-sans">{children}</body>
    </html>
  );
}
