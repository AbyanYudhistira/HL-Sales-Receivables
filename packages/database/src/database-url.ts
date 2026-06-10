export function ensureDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL wajib diisi di .env (contoh: postgresql://user:pass@localhost:5432/hl_sales?schema=public)."
    );
  }

  return databaseUrl;
}
