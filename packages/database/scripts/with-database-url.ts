import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

import { ensureDatabaseUrl } from "../src/database-url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const prismaArgs = process.argv.slice(2);
const isGenerate = prismaArgs[0] === "generate";

config({ path: resolve(packageRoot, ".env") });

// `prisma generate` tidak connect ke DB; placeholder cukup untuk build CI.
if (!process.env.DATABASE_URL?.trim() && isGenerate) {
  process.env.DATABASE_URL =
    "postgresql://build:build@127.0.0.1:5432/build?schema=public";
}

ensureDatabaseUrl();

if (prismaArgs.length === 0) {
  console.error("Usage: tsx scripts/with-database-url.ts <prisma-command> [args...]");
  process.exit(1);
}

const result = spawnSync("prisma", prismaArgs, {
  cwd: packageRoot,
  env: process.env,
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
