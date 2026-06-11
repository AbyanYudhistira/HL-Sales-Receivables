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

Salin `.env.example` ke `.env` / `.env.local` dan sesuaikan `DATABASE_URL`:

```bash
# packages/database/.env
DATABASE_URL=postgresql://postgres:password_anda@localhost:5432/hl_sales?schema=public
ADMIN_EMAIL=admin@hl.local
ADMIN_PASSWORD=admin123

# apps/web/.env.local
DATABASE_URL=postgresql://postgres:password_anda@localhost:5432/hl_sales?schema=public
AUTH_SECRET=generate-random-32-character-secret
ADMIN_EMAIL=admin@hl.local
ADMIN_PASSWORD=admin123
```

Untuk Neon/Vercel, gunakan connection string dari dashboard (wajib sertakan `sslmode=require`).

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

## Deploy Vercel (Preview vs Production)

Develop di **Preview** (branch selain `main`). Production hanya ter-update saat merge ke `main`.

### Konfigurasi project

Project Vercel: `hl-sales-receivables-web` — Root Directory: `apps/web`.

Build monorepo dikontrol lewat [`apps/web/vercel.json`](apps/web/vercel.json):

- Install: `cd ../.. && pnpm install`
- Build: `cd ../.. && pnpm turbo build --filter=@hl/web`

Di **Settings → Git**:

- Production Branch: `main`
- Preview Deployments: enabled

### Environment variables

| Variable | Production | Preview |
|----------|------------|---------|
| `DATABASE_URL` | Neon **main** branch | Neon **preview** branch (terpisah) |
| `AUTH_SECRET` | Secret production | Secret preview (boleh beda) |
| `AUTH_TRUST_HOST` | `true` | `true` |

Jangan set `DATABASE_URL` ke scope "All Environments" — preview akan menulis ke DB production.

### Setup database preview (sekali)

1. Di [Neon Console](https://console.neon.tech), buat branch `preview` dari production.
2. Jalankan migrasi + seed ke DB preview:

```powershell
$env:DATABASE_URL = "postgresql://...connection-string-branch-preview...?sslmode=require"
.\scripts\setup-preview-database.ps1
```

3. Pisahkan env var di Vercel:

```powershell
.\scripts\vercel-split-database-env.ps1 -PreviewDatabaseUrl $env:DATABASE_URL
```

**Opsional — Neon + Vercel integration** (auto branch per preview): terima terms di [Vercel Integrations](https://vercel.com/abyan-yudhistiras-projects/~/integrations/accept-terms/neon), lalu:

```bash
cd apps/web
npx vercel integration add neon -e production -e preview -m auth=false --plan free_v3
```

### Workflow develop

```bash
git checkout -b feat/nama-fitur
git push -u origin feat/nama-fitur
```

Vercel deploy preview otomatis — URL ada di dashboard atau komentar PR. Setelah OK, merge ke `main` untuk production.
