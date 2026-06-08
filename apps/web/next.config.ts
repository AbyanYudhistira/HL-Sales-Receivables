import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hl/database", "@hl/calculations"],
};

export default nextConfig;
