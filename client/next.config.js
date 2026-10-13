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
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Optimize for production
  reactStrictMode: false, // Disable strict mode to reduce hydration warnings
  // Disable x-powered-by header
  poweredByHeader: false,
  // Ensure proper routing
  trailingSlash: false,

  // Proxy backend prefixes → Express, so relative calls never hit Next's own
  // routes (404). Server-side env BACKEND_URL wins; fallback covers local dev.
  // NOTE: when apiClient uses absolute baseURL (NEXT_PUBLIC_API_URL), this is a
  // safety net + CORS-free dev path. Restart `next dev` after editing.
  async rewrites() {
    const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";
    // Must stay in sync with server/server.js app.use() mounts.
    const prefixes = [
      "v1",
      "rooms",
      "bookings",
      "auth",
      "reviews",
      "admin",
      "contacts",
      "upload",
      "favorites",
      "rewards",
      "support",
    ];
    return prefixes.map((p) => ({
      source: `/api/${p}/:path*`,
      destination: `${BACKEND}/api/${p}/:path*`,
    }));
  },

  // The /dashboard user area was removed — send every old dashboard URL
  // (/dashboard, /dashboard/bookings, …) to the Rooms listing instead.
  async redirects() {
    return [
      {
        source: "/dashboard/:path*",
        destination: "/rooms",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
