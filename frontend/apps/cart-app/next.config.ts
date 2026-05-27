import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: process.env.NEXT_PUBLIC_CART_ASSET_PREFIX || "/cart-assets",

  transpilePackages: [
    "@repo/ui",
    "@repo/types",
    "@repo/event-bus",
    "@repo/api-client",
  ],
};

export default nextConfig;