import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // We don't transpile anything special — pure Next.js + Tailwind.
  // Supabase env vars are read at runtime, not build time.
  //
  // Silence multi-lockfile warning: Next was picking C:\Users\nithy\pnpm-lock.yaml
  // over this app's lockfile. Pin file tracing to this project root.
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    // Keep server actions on; we'll use them for favorites / mark-complete.
  },
};

export default nextConfig;