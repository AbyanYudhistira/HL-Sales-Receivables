import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@hl/database", "@hl/calculations"],
  serverExternalPackages: ["@prisma/client", "prisma", "pg", "@prisma/adapter-pg"],
  // Prisma engineType=client needs WASM files in serverless bundles (pnpm monorepo).
  outputFileTracingRoot: monorepoRoot,
  outputFileTracingIncludes: {
    "/*": ["../../node_modules/.pnpm/**/node_modules/.prisma/client/**"],
  },
  async redirects() {
    return [{ source: "/dashboard", destination: "/", permanent: true }];
  },
};

export default nextConfig;
