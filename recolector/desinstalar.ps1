# Quita la Tarea programada del vigía central (PowerShell como administrador).
Unregister-ScheduledTask -TaskName 'El Rio Suena - vigia central' -Confirm:$false -ErrorAction SilentlyContinue
Write-Host 'Tarea quitada.'
