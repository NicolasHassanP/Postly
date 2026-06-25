# start-n8n.ps1
# Carga las variables del archivo .env y arranca n8n.
# Reemplaza el  $env:WEBHOOK_URL="..."; n8n start  hecho a mano.
# Uso:  .\start-n8n.ps1   (parado en la raiz del repo)

$ErrorActionPreference = "Stop"
$envPath = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envPath)) { throw "No encuentro .env junto a este script." }

Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $idx = $line.IndexOf("=")
        $k = $line.Substring(0, $idx).Trim()
        $v = $line.Substring($idx + 1).Trim()
        if ($v -like "*PEGAR*") {
            Write-Host ("  [!] " + $k + " todavia sin completar en .env") -ForegroundColor Yellow
        } else {
            [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
            Write-Host ("  [ok] " + $k + " cargada") -ForegroundColor DarkGray
        }
    }
}

Write-Host ""
Write-Host ("Arrancando n8n con WEBHOOK_URL = " + $env:WEBHOOK_URL) -ForegroundColor Cyan
n8n start
