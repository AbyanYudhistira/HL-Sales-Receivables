# Setup Neon preview/staging database for Vercel Preview deployments.
# Usage:
#   $env:DATABASE_URL = "postgresql://...neon.../hl_sales?sslmode=require"
#   .\scripts\setup-preview-database.ps1
#
# Or pass connection string as first argument:
#   .\scripts\setup-preview-database.ps1 "postgresql://..."

param(
    [string]$PreviewDatabaseUrl = $env:DATABASE_URL
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

if (-not $PreviewDatabaseUrl) {
    Write-Host @"
Preview DATABASE_URL is required.

1. Open https://console.neon.tech and create a branch (e.g. preview) from production.
2. Copy the pooled connection string (include sslmode=require).
3. Re-run:

   `$env:DATABASE_URL = "postgresql://USER:PASSWORD@ep-xxx-pooler.region.aws.neon.tech/hl_sales?sslmode=require"
   .\scripts\setup-preview-database.ps1

Optional — push the URL to Vercel Preview scope only:

   cd apps/web
   npx vercel env rm DATABASE_URL preview -y
   npx vercel env add DATABASE_URL preview --value `$env:DATABASE_URL --yes
"@
    exit 1
}

$env:DATABASE_URL = $PreviewDatabaseUrl

Write-Host "Running migrations on preview database..."
Push-Location $repoRoot
try {
    pnpm db:migrate:deploy
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "Seeding preview database..."
    pnpm db:seed
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "Preview database ready. Add DATABASE_URL to Vercel Preview scope if not done yet."
} finally {
    Pop-Location
}
