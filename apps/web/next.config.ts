import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  output: 'standalone', // optimized for Railway container deploy
  transpilePackages: ['@animood/ui', '@animood/types', '@animood/config', '@animood/seo'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: 's4.anilist.co' },
      { protocol: 'https', hostname: 'img.anili.st' },
    ],
  },
  experimental: {
    // Server actions stay disabled until we genuinely need them; explicit > implicit.
  },
};

export default config;
