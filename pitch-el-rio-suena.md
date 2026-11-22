# El Río Suena — Discurso del pitch

> **Duración:** 2 min 55 s (3 minutos de exposición; deja 5 s de margen) · **Modalidad:** virtual, con pantalla compartida · **Participan:** quien expone, quien opera la demostración y un teléfono de ayudante visible en cámara.
> *Las indicaciones en cursiva no se leen en voz alta.* En el PPTX, las notas del orador siguen este guion; saltar las diapositivas 4, 5, 9, 12 y 14 (quedan de respaldo para las preguntas). Cada bloque indica el criterio de evaluación que atiende.

---

## I. Gancho · 0:00 – 0:15 · *relevancia del problema*

*(Pantalla negra. Dos segundos de silencio.)*

El 13 de diciembre, de madrugada, el Piraí se desbordó en El Torno. **Veintiséis personas murieron.** Nadie recibió un aviso.

Nos preguntamos: **¿se podía avisar antes?**

---

## II. Lo que descubrimos · 0:15 – 0:40 · *originalidad, viabilidad técnica*

*(Abrir «¿Habría avisado la riada real del 13/12/2025?».)*

Revisamos los datos abiertos de esa noche. **Ningún modelo vio la tormenta.** Una app basada solo en satélites no habría avisado.

*(Señalar la línea naranja.)*

Pero río arriba, en Bermejo, **los vecinos sí veían crecer el río.** Con dos vigías que lo reporten, aunque sea con un audio de Telegram, la alerta sale **unas cuatro horas antes.**

---

## III. La solución · 0:40 – 1:55 · *funcionamiento, creatividad, propuesta*

*(Presionar «Sé ayudante» y mostrar el QR cinco segundos.)*

Escaneen este código: ustedes serán los vecinos ayudantes.

*(Presionar «Iniciar simulacro».)*

El Río Suena une **cuatro fuentes**: la lluvia, los vigías, la regla pintada en el puente y **el boletín diario de SENAMHI**, que leemos solos cada día.

Y no dice «alerta roja»: dice **«el agua llega a El Torno en 3 horas»**, barrio por barrio.

*(Señalar la cuenta regresiva.)*

Lo más importante: **nadie queda olvidado.** Quien no puede salir sola —una abuela en silla de ruedas, niños solos— tiene un vecino ayudante.

*(Suena el celular del ayudante. Levantarlo. Los nombres de la demo se sortean: leer el que sale en pantalla.)*

Su celular suena **aunque esté bloqueado**. La central le escribe por chat y él confirma que ya están a salvo. Si 30 minutos antes del agua nadie confirmó, **el caso pasa solo al rescate oficial.**

*(Presionar «Listo, a salvo» en el celular o «Confirmar» en la central. Aparece «Todos a salvo».)*

¿Y si es una falsa alarma? **La junta la cancela con un botón** y todos los celulares lo saben al instante.

---

## IV. Para quién y cómo se implementa · 1:55 – 2:35 · *público, implementación*

Es para las familias de la ribera, para quien no puede evacuar solo y para la **junta vecinal y el COED**, que ven en vivo quién falta.

Se instala en el celular **sin Play Store y funciona sin internet**. Lo probamos con celulares reales: la confirmación llega a la central **en tres segundos.**

Piloto en El Torno esta temporada: diez vigías, cinco reglas, cincuenta personas, **unos mil quinientos bolivianos. Gratis para las familias.** Después, todo el país: **solo cambia el mapa.**

---

## V. Cierre · 2:35 – 2:55 · *impacto*

No reemplazamos la alerta oficial: **la llevamos hasta cada puerta, con minutos, nombres y vecinos.**

El 13 de diciembre, el río sonó, y nadie lo estaba escuchando.

*(Pausa.)*

Cuando el río suena… **el barrio responde.**

Gracias.

---

## Respuestas preparadas para el jurado (20 segundos cada una)

**«¿Sirve fuera de Santa Cruz?»**
Sí. El río, los puntos de lluvia y los barrios son datos de configuración. Open-Meteo y GloFAS cubren todo el país, y cada municipio cuenta con juntas vecinales y una Unidad de Gestión de Riesgos. Cada río adicional requiere un piloto de aproximadamente Bs 1.500.

**«¿Lo probaron en celulares de verdad?»**
Sí. El 21 de noviembre, un teléfono Android y un iPhone recibieron la alerta con sirena y confirmaron el traslado; la central registró el tiempo de respuesta. *(Invitar al jurado a escanear el código QR en ese momento.)*

**«¿Cómo saben que funciona?»**
Lo validamos con la riada real del 13/12/2025 y con 42 años de registros de caudal; el procedimiento está en el repositorio (`herramientas/validar.py`). Con datos satelitales únicamente, el sistema **no** habría alertado; por ello incorporamos a los vigías. La hora de su reporte es una estimación.

**«¿Y los tiempos y alturas?»**
Son estimaciones del prototipo. Durante el piloto se calibrarán con SEARPI y el COED.

**«¿Y las falsas alarmas?»**
Un único reporte no activa la alerta: se requieren dos vigías, lluvia intensa en la cuenca o un caudal superior al percentil 95 de 42 años. Los reportes de la ribera por sí solos únicamente colocan la zona en vigilancia.

**«¿Quién vigila de noche?»**
Una computadora del equipo revisa la cuenca alta cada 10 minutos, las 24 horas, y deja la última lectura en la nube. Si esa computadora se apaga, cada celular sigue vigilando por su cuenta: no hay un único punto de falla.

**«¿Y si el vigía no sabe usar apps?»**
Manda un audio por Telegram, como lo haría con su familia. La computadora del barrio lo transcribe sin enviar el audio a ninguna empresa y solo cuentan los vigías dados de alta por la junta.

**«¿Y si se cae el internet?»**
La aplicación queda instalada y abre sin conexión con la última información disponible. Los guardianes pueden recibir el aviso por SMS o llamada.

**«¿Y los datos de las personas vulnerables?»**
Se almacenan en un registro compartido que solo puede consultarse con la clave de la junta; la clave pública no permite leer las tablas. En producción, cada municipio administraría su propia base de datos.

**«¿En qué se diferencia de Google Flood Hub o de la alerta por colores?»**
Esos sistemas pronostican por tramo de río o por departamento. El Río Suena avisa **por barrio, con minutos y con un vecino asignado**, y detecta tormentas locales mediante personas.

**«¿Y SENAMHI? ¿No compiten?»**
No: lo usamos. Cada día hábil el sistema lee solo el boletín hidrológico de Santa Cruz y toma la amenaza oficial del Piraí por tramo. Si SENAMHI marca amarilla o naranja, la aplicación pasa a vigilancia; si marca roja, alerta. Nunca dice «normal» cuando el aviso oficial dice otra cosa. Lo que SENAMHI no puede hacer es avisar casa por casa: eso lo hacen los vecinos.

**«¿Hay una aplicación para el celular?»**
Sí. Se instala desde el navegador («Instalar como app»), sin Play Store, recuerda la comunidad de cada vecino y, con la app gratuita ntfy, suena aunque la pantalla esté apagada. Quien no quiere ser ayudante puede entrar solo a mirar el río de su barrio.

**«¿Y las falsas alarmas, cómo se corrigen?»**
La junta pulsa «Falsa alarma»: a todos los celulares les llega «Alerta cancelada» en verde, la sirena se apaga y queda en el registro de alertas para ajustar los umbrales. Preferimos una falsa alarma cancelada en un minuto a una riada sin aviso.

**«¿Quién paga esto?»**
Para las familias es gratuito. El piloto cuesta aproximadamente Bs 1.500; posteriormente, el municipio y la Gobernación financian el servicio por tramo de río, con apoyo de la cooperación internacional.

---

## Lista de verificación previa (presentación virtual)

- [ ] Compartir **la pestaña del navegador**, no toda la pantalla, y con el audio de la pestaña activado (para que se oiga la sirena)
- [ ] Botón verde **«Sé ayudante»**: mostrar el QR 10 s e invitar al jurado a escanearlo antes de lanzar el simulacro
- [ ] En ?jurado (×300) el primer caso sin confirmar pasa a **«al rescate»** cerca de 1 min después de la alerta: contestar rápido el chat de los casos que se quieran mostrar, o dejar uno sin responder para enseñar el rescate oficial
- [ ] Un celular propio ya con «Activar avisos», para que se vea sonar en cámara
- [ ] Probar la videollamada 10 min antes (micrófono, cámara, compartir)

- [ ] Volumen del parlante al máximo y probado
- [ ] La página abierta con HTTPS (Pages), ya instalada como app por si falla el wifi
- [ ] Video de respaldo listo: `capturas/demo-respaldo.mp4`
- [ ] La PC de Rodrigo encendida y subiendo lecturas: la fuente del Vigía debe decir **«vigía central (PC del equipo)»**
- [ ] Bot de Telegram encendido (`nodo/`) y un audio de vigía grabado listo para mandar; si falla, usar «Reportar ▾ → Vigía río arriba»
- [ ] En el discurso mostrar solo **dos** cosas nuevas: el audio del vigía y la cuenta regresiva; lo demás, para las preguntas
- [ ] Ensayado con cronómetro: **menos de 2:55** (son 3 min de exposición; si se pasa, recortar la parte IV)
- [ ] Idioma, voz y letra grande están en el botón ⚙; la riada del 13/12/2025 y el micrófono, en «Validación y extras» del Vigía (para las preguntas)
- [ ] Tono respetuoso al referirse a las víctimas del 13/12/2025: son la razón del proyecto
