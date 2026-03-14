import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevents Anthropic SDK from being bundled at build time.
  // Without this, Vercel's Turbopack throws "Neither apiKey nor config.authenticator provided"
  // during static page collection, even with lazy imports.
  serverExternalPackages: ['@anthropic-ai/sdk'],
};

export default nextConfig;
