import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { ensureDatabaseUrl } from "./database-url";

export function createPrismaClient() {
  const pool = new Pool({
    connectionString: ensureDatabaseUrl(),
    // Satu koneksi per serverless invocation (Vercel/Neon pooler).
    max: process.env.VERCEL ? 1 : 10,
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}
