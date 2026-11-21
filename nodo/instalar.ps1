# Instala y arranca el nodo comunitario de El Río Suena en Windows (Docker Desktop).
# Uso, desde la carpeta del repositorio (PowerShell normal, no hace falta administrador):
#   powershell -ExecutionPolicy Bypass -File nodo\instalar.ps1
# Hace todo: pide el token del bot y la clave de la junta, levanta ntfy + túnel + bot + IA local,
# descarga los modelos y abre la central ya conectada al nodo.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Paso($t) { Write-Host "`n== $t" -ForegroundColor Cyan }
function Falla($t) { Write-Host "`n$t" -ForegroundColor Red; exit 1 }

# ---------- 1. Docker ----------
Paso 'Revisando Docker Desktop'
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Falla "No está Docker Desktop. Instálalo con:`n  winget install -e --id Docker.DockerDesktop`nreinicia la PC, abre Docker Desktop una vez y vuelve a correr este script."
}
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Docker no está corriendo: abriendo Docker Desktop…'
  $dd = Join-Path $env:ProgramFiles 'Docker\Docker\Docker Desktop.exe'
  if (Test-Path $dd) { Start-Process $dd }
  for ($i = 0; $i -lt 60; $i++) { Start-Sleep 3; docker info *> $null; if ($LASTEXITCODE -eq 0) { break } }
  if ($LASTEXITCODE -ne 0) { Falla 'Docker Desktop no arrancó. Ábrelo a mano, espera a que diga "Engine running" y vuelve a correr el script.' }
}
Write-Host 'Docker listo.'

# ---------- 2. Configuración (.env) ----------
$envFile = Join-Path $PSScriptRoot '.env'
if (Test-Path $envFile) {
  Paso 'Usando la configuración existente (nodo\.env)'
} else {
  Paso 'Configuración (solo la primera vez)'
  Write-Host 'Token del bot: en Telegram, hablar con @BotFather → /newbot → copiar el token.'
  $seguro = Read-Host 'Pega el token del bot (no se muestra)' -AsSecureString
  $token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($seguro))
  if ($token -notmatch '^\d+:[A-Za-z0-9_-]{30,}$') { Falla 'Ese token no parece válido (formato 123456:ABC…). Vuelve a intentar.' }
  $tema = Read-Host 'Tema del canal [rio-suena-eltorno]'
  if (-not $tema) { $tema = 'rio-suena-eltorno' }
  $tema = ($tema -replace '[^A-Za-z0-9_-]', '')
  $clave = Read-Host 'Clave que la junta les dará a los vigías para darse de alta'
  if (-not $clave -or $clave -match '\s') { Falla 'La clave no puede estar vacía ni tener espacios.' }
  $lineas = @(
    "TELEGRAM_TOKEN=$token", "TEMA=$tema", "JUNTA_CLAVE=$clave",
    'WHISPER_MODELO=small', 'OLLAMA_URL=http://ollama:11434', 'OLLAMA_MODELO=qwen2.5:3b'
  )
  # sin BOM: Docker leería la primera variable con un carácter invisible delante
  [IO.File]::WriteAllText($envFile, ($lineas -join "`n") + "`n", (New-Object Text.UTF8Encoding $false))
  Write-Host 'Guardado en nodo\.env (no se sube a git).'
}
$cfg = @{}; Get-Content $envFile | ForEach-Object { if ($_ -match '^\s*([A-Z0-9_]+)\s*=\s*(.*)$') { $cfg[$matches[1]] = $matches[2] } }

# ---------- 3. Levantar el nodo ----------
Paso 'Levantando ntfy + túnel + bot del vigía + IA local (la primera vez tarda unos minutos)'
docker compose --profile ia up -d --build
if ($LASTEXITCODE -ne 0) { Falla 'docker compose falló. Revisa el mensaje de arriba.' }

Paso 'Descargando el modelo de IA local (qwen2.5:3b, ~2 GB, solo la primera vez)'
docker compose exec -T ollama ollama pull $cfg['OLLAMA_MODELO']

Paso 'Descargando Whisper (~500 MB, solo la primera vez) para que el primer audio no tarde'
docker compose exec -T vigia python -c "from faster_whisper import WhisperModel; WhisperModel('$($cfg['WHISPER_MODELO'])', device='cpu', compute_type='int8'); print('Whisper listo')"

# ---------- 4. Dirección pública del ntfy de la comunidad ----------
Paso 'Esperando la dirección pública del túnel'
$url = $null
for ($i = 0; $i -lt 30 -and -not $url; $i++) {
  $m = (docker compose logs tunel 2>&1 | Out-String) | Select-String -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -AllMatches
  if ($m) { $url = $m.Matches[-1].Value } else { Start-Sleep 2 }
}
if (-not $url -and $cfg['CLOUDFLARE_TOKEN']) { $url = Read-Host 'Túnel con dirección fija: escribe su URL https' }

$central = "https://neckhurtttt.github.io/el-rio-suena/?jurado&t=$($cfg['TEMA'])"
if ($url) { $central += "&ntfy=$url" } else { Write-Warning 'No apareció la URL del túnel: la central funciona igual por ntfy.sh. Mira: docker compose logs tunel' }
New-Item -ItemType Directory -Force (Join-Path $PSScriptRoot 'datos') | Out-Null
Set-Content -Path (Join-Path $PSScriptRoot 'datos\central.txt') -Value $central -Encoding UTF8

Paso 'Listo'
Write-Host "ntfy de la comunidad: $url"
Write-Host "Central conectada al nodo (guardada en nodo\datos\central.txt):`n  $central" -ForegroundColor Green
Write-Host "`nCada vigía abre el bot en Telegram y escribe:  /alta <clave de la junta> bermejo"
Write-Host '(puestos: bermejo, espejos, samaipata, angostura). Después manda un audio: "el río está creciendo".'
Write-Host "`nVer qué entiende el bot:  docker compose -f nodo\docker-compose.yml logs -f vigia"
Write-Host 'Apagar el nodo:           docker compose -f nodo\docker-compose.yml --profile ia down'
Start-Process $central
