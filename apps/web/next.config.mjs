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
};

export default nextConfig;
