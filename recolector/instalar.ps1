# Instala el recolector de El Río Suena como Tarea programada de Windows.
# Uso (PowerShell como administrador, desde la carpeta del repositorio):
#   powershell -ExecutionPolicy Bypass -File recolector\instalar.ps1
# Corre "node recolector\recolector.mjs --una-vez" cada 10 minutos y al iniciar Windows,
# aunque no haya sesión iniciada, sin ventana y también con batería.
$ErrorActionPreference = 'Stop'
$Nombre = 'ElRioSuena-Recolector'

$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $admin) { Write-Error 'Abre PowerShell como ADMINISTRADOR (clic derecho → Ejecutar como administrador) y vuelve a correr este script.' }

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { Write-Error 'No se encontró Node.js. Instala Node 20 o más nuevo desde https://nodejs.org y vuelve a intentar.' }
$version = [int]((& $node -p 'process.versions.node.split(".")[0]'))
if ($version -lt 20) { Write-Error "Node $version es muy viejo: hace falta Node 20 o más nuevo." }

$script = Join-Path $PSScriptRoot 'recolector.mjs'
$repo = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $PSScriptRoot '.env'))) {
  Write-Warning 'Falta recolector\.env (copia .env.ejemplo y pon la clave). Las lecturas quedarán en pendientes.jsonl hasta que esté.'
}

$accion = New-ScheduledTaskAction -Execute $node -Argument "`"$script`" --una-vez" -WorkingDirectory $repo

# Cada 10 minutos desde ahora (sin fecha de fin) y además al iniciar Windows.
$cada10 = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 10)
$alIniciar = New-ScheduledTaskTrigger -AtStartup
$alIniciar.Repetition = $cada10.Repetition

# S4U = "Ejecutar tanto si el usuario inició sesión como si no", sin guardar contraseña y sin ventana visible.
$usuario = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$quien = New-ScheduledTaskPrincipal -UserId $usuario -LogonType S4U -RunLevel Limited

$ajustes = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable `
  -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 5)

Register-ScheduledTask -TaskName $Nombre -Action $accion -Trigger @($cada10, $alIniciar) -Principal $quien -Settings $ajustes `
  -Description 'El Río Suena: lee lluvia y caudal del Piraí cada 10 min y los sube a Supabase.' -Force | Out-Null

Start-ScheduledTask -TaskName $Nombre
Write-Host "Listo: tarea '$Nombre' instalada para $usuario y ejecutada una vez." -ForegroundColor Green
Write-Host "Registro: $(Join-Path $PSScriptRoot 'registro.log')"
Write-Host 'Recomendado: Configuración → Sistema → Energía → que la PC no se suspenda cuando está enchufada.'
