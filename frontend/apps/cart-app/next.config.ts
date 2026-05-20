import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    "@repo/ui",
    "@repo/types",
    "@repo/event-bus",
    "@repo/api-client"
  ]
};

export default nextConfig;
