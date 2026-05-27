import type { NextConfig } from "next";

const cartZoneUrl = process.env.CART_ZONE_URL || "http://localhost:3001";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@repo/ui",
    "@repo/types",
    "@repo/event-bus",
    "@repo/api-client",
  ],

  async rewrites() {
    return [
      {
        source: "/cart-assets/_next/webpack-hmr",
        destination: `${cartZoneUrl}/_next/webpack-hmr`,
      },
      {
        source: "/cart-assets/_next/:path*",
        destination: `${cartZoneUrl}/_next/:path*`,
      },
      {
        source: "/cart",
        destination: `${cartZoneUrl}`,
      },
      {
        source: "/cart/:path*",
        destination: `${cartZoneUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;