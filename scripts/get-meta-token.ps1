# get-meta-token.ps1
# Convierte un token CORTO de Meta (del Graph API Explorer) en uno LARGO (60 dias)
# y obtiene el PAGE ACCESS TOKEN (que no expira) para publicar en IG/FB.
#
# Uso:
#   .\scripts\get-meta-token.ps1 -ShortToken "EAAxxxx..."
#
# Lee META_APP_ID y META_APP_SECRET del .env en la raiz del repo.
# El App Secret nunca se muestra en pantalla ni se sube a git.

param(
    [Parameter(Mandatory = $true)]
    [string]$ShortToken
)

$ErrorActionPreference = "Stop"
$apiVersion = "v19.0"

# --- cargar .env ---
$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) { throw "No encuentro .env en $envPath" }
$envVars = @{}
Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $idx = $line.IndexOf("=")
        $envVars[$line.Substring(0, $idx).Trim()] = $line.Substring($idx + 1).Trim()
    }
}
$appId = $envVars["META_APP_ID"]
$appSecret = $envVars["META_APP_SECRET"]
if (-not $appId -or $appId -like "*PEGAR*") { throw "Carga META_APP_ID en .env primero." }
if (-not $appSecret -or $appSecret -like "*PEGAR*") { throw "Carga META_APP_SECRET en .env primero." }

# --- 1) short -> long (60 dias) ---
Write-Host ""
Write-Host "[1/2] Intercambiando token corto por token largo (60 dias)..." -ForegroundColor Cyan
$exchUrl = "https://graph.facebook.com/$apiVersion/oauth/access_token" +
    "?grant_type=fb_exchange_token&client_id=$appId&client_secret=$appSecret&fb_exchange_token=$ShortToken"
$long = Invoke-RestMethod -Uri $exchUrl -Method Get
$longToken = $long.access_token
Write-Host "OK - token largo de USUARIO (60 dias) obtenido." -ForegroundColor Green

# --- 2) Page Access Token (no expira) ---
Write-Host ""
Write-Host "[2/2] Buscando Page Access Tokens (no expiran)..." -ForegroundColor Cyan
$pagesUrl = "https://graph.facebook.com/$apiVersion/me/accounts?access_token=$longToken"
$pages = Invoke-RestMethod -Uri $pagesUrl -Method Get

if (-not $pages.data -or $pages.data.Count -eq 0) {
    Write-Host "No aparecieron Paginas. El token corto tenia el scope 'pages_show_list'?" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternativa: usa el token largo de usuario (vence en 60 dias):" -ForegroundColor Yellow
    Write-Host $longToken
} else {
    foreach ($p in $pages.data) {
        Write-Host ""
        Write-Host ("Pagina: " + $p.name + "  (id " + $p.id + ")") -ForegroundColor Green
        Write-Host "  PAGE ACCESS TOKEN (pega ESTE en .env como META_ACCESS_TOKEN):"
        Write-Host ("  " + $p.access_token)
    }
    Write-Host ""
    Write-Host "=> Copia el Page Access Token de TU pagina y pegalo en .env como META_ACCESS_TOKEN" -ForegroundColor Cyan
}
