import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Force Turbopack to treat this folder as the workspace root
  // so it picks up .env.local, package.json, etc. from the `repo` directory
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
