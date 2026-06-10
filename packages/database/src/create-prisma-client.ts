import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { ensureDatabaseUrl } from "./database-url";

export function createPrismaClient() {
  const pool = new Pool({ connectionString: ensureDatabaseUrl() });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}
