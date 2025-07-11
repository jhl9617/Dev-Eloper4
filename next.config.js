/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable if you want to use Turbopack (keep disabled for now)
    // turbo: {},
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Enable if you're having issues with CSS imports
  transpilePackages: ['highlight.js'],
};

module.exports = nextConfig;