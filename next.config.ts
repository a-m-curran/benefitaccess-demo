import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Prevents Anthropic SDK from being bundled at build time.
  serverExternalPackages: ['@anthropic-ai/sdk'],
  // Pin Turbopack's workspace root to this directory so it doesn't walk up
  // and pick up the parent package-lock.json when started from a parent dir.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
