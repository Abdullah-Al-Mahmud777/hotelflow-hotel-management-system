/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  // Optimize for production
  reactStrictMode: true,
  // Enable SWC minification
  swcMinify: true,
  // Disable x-powered-by header
  poweredByHeader: false,
};

module.exports = nextConfig;
