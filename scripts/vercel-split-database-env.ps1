# Split DATABASE_URL so Production and Preview use different Neon databases.
# Usage:
#   .\scripts\vercel-split-database-env.ps1 -PreviewDatabaseUrl "postgresql://..."

param(
    [Parameter(Mandatory = $true)]
    [string]$PreviewDatabaseUrl
)

$ErrorActionPreference = "Stop"
$webDir = Join-Path (Split-Path -Parent $PSScriptRoot) "apps\web"

if (-not (Test-Path (Join-Path $webDir ".vercel\project.json"))) {
    Write-Host "Linking apps/web to Vercel project..."
    Push-Location $webDir
    npx vercel link --yes --project hl-sales-receivables-web
    Pop-Location
}

Push-Location $webDir
try {
    Write-Host "Removing DATABASE_URL from Preview scope (Production unchanged)..."
    npx vercel env rm DATABASE_URL preview -y

    Write-Host "Adding preview-only DATABASE_URL..."
    npx vercel env add DATABASE_URL preview --value $PreviewDatabaseUrl --yes

    Write-Host "Done. Production keeps its existing DATABASE_URL; Preview now uses the staging branch."
} finally {
    Pop-Location
}
