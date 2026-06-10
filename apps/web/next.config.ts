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
    return [
      { source: "/dashboard", destination: "/", permanent: true },
      { source: "/pelanggan", destination: "/customers", permanent: false },
      { source: "/pelanggan/:id", destination: "/customers/:id", permanent: false },
      { source: "/barang", destination: "/products", permanent: false },
      { source: "/penjualan", destination: "/transactions", permanent: false },
      { source: "/penjualan/baru", destination: "/transactions/new", permanent: false },
      { source: "/penjualan/:id", destination: "/transactions/:id", permanent: false },
    ];
  },
};

export default nextConfig;
