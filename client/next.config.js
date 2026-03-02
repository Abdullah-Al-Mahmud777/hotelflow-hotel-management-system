/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Optimize for production
  reactStrictMode: false, // Disable strict mode to reduce hydration warnings
  // Disable x-powered-by header
  poweredByHeader: false,
  // Ensure proper routing
  trailingSlash: false,
};

module.exports = nextConfig;
