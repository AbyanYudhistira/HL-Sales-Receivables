export function ensureDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL wajib diisi di .env (contoh: postgresql://user:pass@localhost:5432/hl_sales?schema=public)."
    );
  }

  return normalizeDatabaseUrl(databaseUrl);
}

/** Neon/Vercel: hapus channel_binding, pakai sslmode yang kompatibel serverless. */
export function normalizeDatabaseUrl(databaseUrl: string): string {
  const url = new URL(databaseUrl);

  url.searchParams.delete("channel_binding");

  const sslMode = url.searchParams.get("sslmode");
  if (sslMode === "require" || sslMode === "prefer" || sslMode === "verify-ca") {
    url.searchParams.set("sslmode", "verify-full");
  }

  return url.toString();
}
