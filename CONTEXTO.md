# CONTEXTO — El Río Suena (Abstracthon 21–22/11/2026, track Ayuda Tecnológica = Comunicación + Educación)

## Criterios (la web no publica criterios; los del track)
- [x] Problema real de un grupo vulnerable concreto: ribera del Piraí, quien no puede evacuar solo
- [x] Mezcla 2 tracks (obligatorio): Comunicación (barrio se informa/coordina: alertas, reportes, guardián) + Educación (regla pintada, pared, índice explicado)
- [x] Demo en vivo: simulacro → detección → cuenta regresiva → guardián confirma → "Todos a salvo"
- [ ] Validar el tiempo de viaje de la crecida y los barrios con SEARPI/COED
- [ ] Preguntar a MLSA si se permite una base previa (si no: llevar solo idea/diseño)

## Estado (18/11)
Hecho: oído (simulacro + micrófono), mapa, cuenta regresiva, lluvia real, confianza, regla pintada (lectura con 3 toques), pared con cámara y respaldo dibujado, guardianes (ntfy + BroadcastChannel), pantalla de éxito, ?jurado, celular OK, 11 pruebas.
Pendiente:
- Probar ntfy con internet real y 2 celulares (desde esta compu ntfy.sh no respondía).
- Probar micrófono con parlante real (rugido grabado de un río).
- Audio real de crecida (grabación con licencia libre) en vez del sintetizado.
- Aviso en video LSB (puente con Manos que hablan) y audios en quechua/guaraní grabados por hablantes.
- ~~Pages, video de respaldo, slides~~ HECHO (Pages + capturas/demo-respaldo.mp4 + release v1.0-abstracthon + PPTX).

## Giro 19/11: datos abiertos, sin hardware
La alerta principal ya no depende del micrófono: el **Vigía del Piraí** calcula un índice de riesgo 0–100 con
lluvia de 5 puntos de la cuenca alta (Open-Meteo), caudal GloFAS en La Angostura (Open-Meteo Flood API) y reportes de vecinos
(`indiceRiesgo` en js/datos.js, escaneo en js/lluvia.js cada 10 min). Al cruzar 55 → alerta con 2 h 30 min de ventaja
(LAG_CUENCA_MIN) antes de que la crecida llegue a La Angostura. Reportes de vecinos solos no alertan (solo vigilancia).
El oído del río (micrófono) queda como extra opcional. ?jurado acelera ×300.

## Cómo retomar
`python3 -m http.server 8765` → `localhost:8765/?jurado`. Atajo para pruebas en consola: `__rs.alerta(3,'prueba')`, `__rs.confirmar('rosa','central')`. Parámetro `x=` cambia la aceleración (por defecto 150 en ?jurado).

## 21/11 madrugada: «que el proyecto sea perfecto»
Criterios del jurado (WhatsApp): originalidad, creatividad, diferenciación, implementación, funcionamiento, propuesta, adecuación de tecnologías, relevancia, claridad del público, beneficio, innovación/viabilidad/impacto.
Hecho:
- **Validación con la riada real 13/12/2025** (El Torno, ≥20 muertos): ningún modelo abierto vio la tormenta (≤26 mm, GloFAS plano) → con solo datos abiertos NO habría avisado. Cambio de diseño: **2 vigías río arriba disparan la alerta** (`vigias` en indiceRiesgo, LAG_VIGIA_MIN 60). Con vigías: ~4 h de aviso (hora de reporte hipotética). Botón en la app + `herramientas/validar.py` + `js/historico.js`.
- CAUDAL_HIST recalibrado con 42 años de GloFAS (p95 35, antes 17 con 2024–26).
- PWA sin internet (`sw.js`, manifest, iconos PNG), chip «Sin internet».
- SMS / llamada al guardián desde cada persona avisada.
- Registro de personas + aprobación de la junta + panel junta/COED (CSV `;`, imprimir) — `js/registro.js` (localStorage).
- Accesibilidad: botón Aa (letra grande + contraste), 🔊 leer aviso.
- «Todos a salvo» con métricas: personas, margen promedio, 0 Bs.
- README: propuesta, público, validación, diferenciación, tecnologías, implementación con costos, impacto. Pitch reescrito (3:30). PPTX: diapositivas 1, 2 (nueva, gráfica), 5, 6, 11, 12 cambiadas SIN poder renderizar → revisar a mano.
- Video de respaldo nuevo (riada + simulacro + junta + registro + guardián + pared, 90 s).
Pendiente: revisar PPTX visualmente; probar ntfy con 2 celulares; base compartida para el registro; vigías reales.
