# CONTEXTO — El Río Suena (Abstracthon 21–22/11/2026, track Ayuda Tecnológica)

## Criterios (la web no publica criterios; los del track)
- [x] Problema real de un grupo vulnerable concreto: ribera del Piraí, quien no puede evacuar solo
- [x] Emergencias + accesibilidad/inclusión (aviso en señas, idiomas, guardián)
- [x] Demo en vivo: simulacro → detección → cuenta regresiva → guardián confirma → "Todos a salvo"
- [ ] Validar el tiempo de viaje de la crecida y los barrios con SEARPI/COED
- [ ] Preguntar a MLSA si se permite una base previa (si no: llevar solo idea/diseño)

## Estado (18/11)
Hecho: oído (simulacro + micrófono), mapa, cuenta regresiva, lluvia real, confianza, regla pintada (lectura con 3 toques), pared con cámara y respaldo dibujado, guardianes (ntfy + BroadcastChannel), pantalla de éxito, ?jurado, celular OK, 8 pruebas.
Pendiente:
- Probar ntfy con internet real y 2 celulares (desde esta compu ntfy.sh no respondía).
- Probar micrófono con parlante real (rugido grabado de un río).
- Audio real de crecida (grabación con licencia libre) en vez del sintetizado.
- Aviso en video LSB (puente con Manos que hablan) y audios en quechua/guaraní grabados por hablantes.
- Subir a GitHub Pages (HTTPS para cámara y micrófono), video de respaldo, slides.

## Giro 19/11: datos abiertos, sin hardware
La alerta principal ya no depende del micrófono: el **Vigía del Piraí** calcula un índice de riesgo 0–100 con
lluvia de 5 puntos de la cuenca alta (Open-Meteo), caudal GloFAS en La Angostura (Open-Meteo Flood API) y reportes de vecinos
(`indiceRiesgo` en js/datos.js, escaneo en js/lluvia.js cada 10 min). Al cruzar 55 → alerta con 2 h 30 min de ventaja
(LAG_CUENCA_MIN) antes de que la crecida llegue a La Angostura. Reportes de vecinos solos no alertan (solo vigilancia).
El oído del río (micrófono) queda como extra opcional. ?jurado acelera ×300.

## Cómo retomar
`python3 -m http.server 8765` → `localhost:8765/?jurado`. Atajo para pruebas en consola: `__rs.alerta(3,'prueba')`, `__rs.confirmar('rosa','central')`. Parámetro `x=` cambia la aceleración (por defecto 150 en ?jurado).
