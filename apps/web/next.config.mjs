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
    // Use INTERNAL_API_URL (private Railway networking) in prod, fall back
    // to NEXT_PUBLIC_API_URL, then localhost for local dev.
    // This proxy makes all API calls same-origin from the browser so the
    // browser never sends a CORS preflight — completely sidestepping the
    // Railway edge-proxy CORS issue.
    const dest =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${dest}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
