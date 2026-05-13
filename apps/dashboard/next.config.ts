import type { NextConfig } from 'next';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const config: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Proxy /api/* to the Express api, so the dashboard browser stays on the
      // same origin and the session cookie just works.
      { source: '/api/:path*', destination: `${apiUrl}/:path*` },
    ];
  },
};

export default config;
