# El Río Suena · instala el vigía central como Tarea programada de Windows (cada 10 min, sin ventana).
# Ejecutar en PowerShell COMO ADMINISTRADOR, desde la carpeta del repo:
#   powershell -ExecutionPolicy Bypass -File recolector\instalar.ps1
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { Write-Error 'No se encontró Node.js. Instalar Node 20 o más nuevo desde https://nodejs.org y volver a correr.' }
$ver = [int]((& $node -v).TrimStart('v').Split('.')[0])
if ($ver -lt 20) { Write-Error "Node $ver es muy viejo: hace falta 20 o más nuevo." }
if (-not (Test-Path (Join-Path $PSScriptRoot '.env'))) { Write-Error 'Falta recolector\.env (copiar .env.ejemplo y poner RECOLECTOR y TOKEN).' }

$nombre = 'El Rio Suena - vigia central'
$accion = New-ScheduledTaskAction -Execute $node -Argument "`"$PSScriptRoot\recolector.mjs`" --una-vez" -WorkingDirectory $repo
$cada10 = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 10)
$alIniciar = New-ScheduledTaskTrigger -AtStartup
$ajustes = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 9) -MultipleInstances IgnoreNew -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
# SYSTEM: corre aunque nadie haya iniciado sesión y sin abrir ventana
$quien = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName $nombre -Action $accion -Trigger $cada10, $alIniciar -Settings $ajustes -Principal $quien -Force | Out-Null
Start-ScheduledTask -TaskName $nombre
Write-Host "Listo: '$nombre' corre cada 10 min. Registro: $PSScriptRoot\registro.log"
Write-Host 'Recomendado: Configuración > Sistema > Energía: que la PC no se suspenda cuando está enchufada.'
