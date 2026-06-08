export function buildDatabaseUrl(): string {
  const user = process.env.POSTGRES_USER ?? "postgres";
  const password = process.env.POSTGRES_PASSWORD;
  const host = process.env.POSTGRES_HOST ?? "localhost";
  const port = process.env.POSTGRES_PORT ?? "5432";
  const database = process.env.POSTGRES_DB ?? "hl_sales";

  if (!password) {
    throw new Error(
      "POSTGRES_PASSWORD wajib diisi di .env (atau set DATABASE_URL manual)."
    );
  }

  const encodedPassword = encodeURIComponent(password);

  return `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}?schema=public`;
}

export function ensureDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = buildDatabaseUrl();
  }

  return process.env.DATABASE_URL;
}
