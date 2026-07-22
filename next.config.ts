import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // We don't transpile anything special — pure Next.js + Tailwind.
  // Supabase env vars are read at runtime, not build time.
  experimental: {
    // Keep server actions on; we'll use them for favorites / mark-complete.
  },
};

export default nextConfig;