# El Río Suena

**Cuando el río suena, piedras trae.** Hay celulares que escuchan el Piraí, una cuenta regresiva para cada barrio y un vecino guardián para cada persona que no puede salir sola.

![Alerta en escritorio](capturas/escritorio-guardianes.png)

- Demo: abrir `index.html?jurado` y tocar **Iniciar simulacro**.
- Celular del guardián: botón «Celular del guardián» → QR (`guardian.html?t=<tema>&p=rosa`).

## Problema
Las riadas del Piraí (El Torno, desastre departamental) y el fenómeno de El Niño 2026-27 ponen en riesgo a los barrios de la ribera. Las alertas actuales son por colores y para todo el departamento. Nadie le dice a cada cuadra **cuánto falta**, y las personas que no pueden evacuar solas (adultos mayores, personas en silla de ruedas, personas sordas, niños solos) dependen de la suerte.

## Solución
1. **Vigía del Piraí, sin hardware.** Cada 10 minutos escanea datos abiertos: lluvia en 5 puntos de la cuenca alta (Samaipata, Bermejo, Cuevas… vía Open-Meteo) y caudal modelado GloFAS en La Angostura. Junto con los reportes de vecinos («el río creció», **fotos de reglas pintadas**) calcula un índice de riesgo 0–100. La lluvia de la cuenca alta tarda unas 2 h 30 min en bajar hasta La Angostura: ese es el tiempo que se gana. Extra opcional: un celular que *escucha* el rugido grave del río (20–300 Hz).
2. **Cuenta regresiva por barrio**, calculada sobre el cauce: «el agua llega a El Torno en 2 h 20 min».
3. **El agua en tu pared.** Se apunta la cámara a la casa y la app muestra hasta dónde llegaría el agua. Muchas personas no evacúan porque no creen que el agua vaya a llegar.
4. **Vecino Guardián.** Cada persona que no puede salir sola tiene un vecino asignado. Cuando hay alerta, el celular del guardián suena y vibra, y él confirma con un toque. Si nadie confirma 30 minutos antes de que llegue el agua, el caso pasa al rescate oficial.

## Cómo funciona
- Web estática (sin backend). Mapa con MapLibre y OpenFreeMap. Audio con Web Audio (FFT de 4096 muestras, energía 20–300 Hz contra la línea base, y aviso si la subida se sostiene 1,5 s).
- Canal hacia los guardianes: ntfy.sh (pub/sub, se puede recibir en la app ntfy) y BroadcastChannel como respaldo dentro de la misma compu.
- Plan B sin internet: lluvia de respaldo, fondo de mapa liso, pared dibujada si no hay cámara y simulacro con audio sintetizado.

## Correrlo
```
python3 -m http.server 8765    # http://localhost:8765/?jurado
node pruebas.mjs               # 8 pruebas
```
La cámara y el micrófono necesitan HTTPS o localhost.

## Honestidad
- Las distancias, velocidades y alturas son **estimadas**; hay que calibrarlas con SEARPI y el COED.
- La detección acústica es un prototipo. El monitoreo acústico y sísmico de crecidas existe en investigación, pero esto no reemplaza a las estaciones oficiales: las complementa.
- Las personas de la demo son ficticias. El tema público de ntfy sirve solo para la demo; en producción iría un servidor propio.
