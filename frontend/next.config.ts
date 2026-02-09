import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone mode disabled temporarily due to Next.js 16.1.6 build issue in Docker
  // output: 'standalone',
};

export default nextConfig;
