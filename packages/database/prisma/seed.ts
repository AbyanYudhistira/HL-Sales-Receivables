import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { createPrismaClient } from "../src/create-prisma-client";
import { ensureDatabaseUrl } from "../src/database-url";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });
ensureDatabaseUrl();

const prisma = createPrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@hl.local").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: "HL Operator" },
    create: {
      email,
      passwordHash,
      name: "HL Operator",
    },
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
