/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@picflow/shared'],
  images: {
    remotePatterns: [
      // R2 public bucket (wildcard) — set via env in real deployments.
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        // Proxy all /api/* requests through Next.js to the NestJS backend.
        // The browser only talks to the Next.js origin (same-origin) so
        // CORS preflight is never triggered.
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
