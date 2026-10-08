import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
