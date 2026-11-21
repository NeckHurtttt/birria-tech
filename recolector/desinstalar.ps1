# Quita la Tarea programada del recolector de El Río Suena.
# Uso: powershell -ExecutionPolicy Bypass -File recolector\desinstalar.ps1   (como administrador)
$Nombre = 'ElRioSuena-Recolector'
if (Get-ScheduledTask -TaskName $Nombre -ErrorAction SilentlyContinue) {
  Stop-ScheduledTask -TaskName $Nombre -ErrorAction SilentlyContinue
  Unregister-ScheduledTask -TaskName $Nombre -Confirm:$false
  Write-Host "Tarea '$Nombre' eliminada. La app sigue funcionando: escanea desde el navegador." -ForegroundColor Green
} else {
  Write-Host "No había ninguna tarea '$Nombre' instalada."
}
