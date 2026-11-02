import type { NextConfig } from 'next';

// Local hostnames (e.g. behind nginx) the dev server must accept, comma-separated, without scheme
// or port: DEV_ALLOWED_ORIGINS=web.example.local. Next.js 16 blocks dev assets and HMR for any
// other hostname than localhost. Dev-only: ignored by `next build` / `next start`.
const allowedDevOrigins = (process.env.DEV_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    allowedDevOrigins,
    experimental: {
        authInterrupts: true,
    },
};

export default nextConfig;
