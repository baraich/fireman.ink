import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    nextScriptWorkers: true,
  },
};

export default nextConfig;
