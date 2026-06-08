# HL Sales & Receivables App

Monorepo aplikasi manajemen penjualan dan piutang HL.

## Tech Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **App:** Next.js 15 (App Router) — frontend + backend
- **Database:** PostgreSQL + Prisma
- **Auth:** Auth.js (Credentials, single user)
- **Calculations:** `@hl/calculations` (diskon cascading, omzet, laba, bonus)

## Struktur

```
apps/web              → Next.js app (UI, Server Actions, Auth)
packages/database     → Prisma schema & client
packages/calculations → Business logic formulas
```

## Setup Lokal

### 1. PostgreSQL

Buat database:

```sql
CREATE DATABASE hl_sales;
```

### 2. Environment

Salin dan sesuaikan kredensial Postgres Anda (cukup variabel `POSTGRES_*`, **tanpa** `DATABASE_URL` manual):

```bash
# packages/database/.env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password_anda
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=hl_sales
ADMIN_EMAIL=admin@hl.local
ADMIN_PASSWORD=admin123

# apps/web/.env.local
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password_anda
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=hl_sales
AUTH_SECRET=generate-random-32-character-secret
ADMIN_EMAIL=admin@hl.local
ADMIN_PASSWORD=admin123
```

`DATABASE_URL` dibuat otomatis dari variabel di atas.

### 3. Install & Database

```bash
pnpm install
pnpm db:migrate
pnpm db:seed
```

### 4. Jalankan

```bash
pnpm dev
```

Buka http://localhost:3000 — login dengan `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Scripts

| Command | Deskripsi |
|---------|-----------|
| `pnpm dev` | Jalankan dev server |
| `pnpm build` | Build production |
| `pnpm test` | Jalankan tests |
| `pnpm db:migrate` | Prisma migrate dev |
| `pnpm db:seed` | Seed admin user |
| `pnpm db:studio` | Prisma Studio GUI |

## Login Default (dev)

- Email: `admin@hl.local`
- Password: `admin123`

Ganti di `.env` sebelum production.
