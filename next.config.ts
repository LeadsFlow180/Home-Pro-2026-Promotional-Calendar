import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Force Turbopack to treat this folder as the workspace root
  // so it picks up .env.local, package.json, etc. from the `repo` directory
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
