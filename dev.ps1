<#
.SYNOPSIS
    Start Dukaan backend (Docker) and frontend (Next.js) concurrently.
.DESCRIPTION
    Launches docker compose for backend services and npm dev for the frontend
    in parallel. Ctrl+C or close the window to stop both.
#>

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend\dukaan-web"

Write-Host "=== Dukaan Dev ===" -ForegroundColor Cyan

# --- Pre-flight checks ---
foreach ($dir in @($backendDir, $frontendDir)) {
    if (!(Test-Path $dir)) {
        Write-Host "ERROR: $dir not found" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[1/2] Starting backend (Docker Compose)..." -ForegroundColor Yellow
$backendProc = Start-Process -PassThru -NoNewWindow powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backendDir'; docker compose up"
)

Write-Host "[2/2] Starting frontend (Next.js dev)..." -ForegroundColor Yellow
$frontendProc = Start-Process -PassThru -NoNewWindow powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontendDir'; npm run dev"
)

Write-Host ""
Write-Host "Services starting:" -ForegroundColor Green
Write-Host "  Backend  : http://localhost:5001 (API)" -ForegroundColor Gray
Write-Host "  Frontend : http://localhost:3000 (Next.js)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop, or close this window." -ForegroundColor DarkGray
Write-Host ""

try {
    # Wait for both to exit (or Ctrl+C)
    $backendProc.WaitForExit()
} finally {
    # Cleanup: kill both if one exits
    Write-Host "`nShutting down..." -ForegroundColor Yellow
    if (!$backendProc.HasExited) { Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue }
    if (!$frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue }

    # Also stop docker compose in case it persists
    Push-Location $backendDir
    docker compose down 2>$null
    Pop-Location

    Write-Host "Stopped." -ForegroundColor Green
}
