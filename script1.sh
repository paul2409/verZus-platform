#!/usr/bin/env bash
set -euo pipefail

echo "VERZUS - Repair corrupted Next.js generated route types"
echo "No branch will be created or changed."
echo

if [[ ! -f "package.json" ]]; then
  echo "Error: package.json was not found."
  echo "Run this script from the VERZUS repository root."
  exit 1
fi

echo "Stopping VERZUS visual-review processes on ports 3104 and 3105..."

if command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -ExecutionPolicy Bypass -Command '
    $ports = @(3104, 3105)
    $processIds = @()

    foreach ($port in $ports) {
      try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

        foreach ($connection in $connections) {
          if ($connection.OwningProcess -gt 0) {
            $processIds += $connection.OwningProcess
          }
        }
      } catch {
      }
    }

    $processIds = $processIds | Sort-Object -Unique

    foreach ($processId in $processIds) {
      try {
        $process = Get-Process -Id $processId -ErrorAction Stop
        Write-Host ("Stopping PID {0}: {1}" -f $processId, $process.ProcessName)
        Stop-Process -Id $processId -Force -ErrorAction Stop
      } catch {
        Write-Host ("Could not stop PID {0}: {1}" -f $processId, $_.Exception.Message)
      }
    }
  ' || true
else
  echo "PowerShell was not available. Continuing without port cleanup."
fi

echo
echo "Removing generated Next.js output..."
rm -rf .next

echo "Removed: .next"

echo
echo "Rebuilding generated Next.js types..."
npm run typecheck

echo
echo "Running production build..."
npm run build

echo
echo "Verifying M4 route discovery..."
npm run m4:routes

echo
echo "Repair completed successfully."
echo
echo "Start the visual review with:"
echo "npm run m4:visual-review"
echo
echo "Then open:"
echo "http://localhost:3105"
