# El Río Suena — Discurso del pitch

> **Duración:** 3 min 45 s (el reglamento asigna 4 minutos de exposición y 3 de preguntas) · **Modalidad:** virtual, con pantalla compartida · **Participan:** quien expone, quien opera la demostración y un teléfono de guardián visible en cámara.
> *Las indicaciones en cursiva no se leen en voz alta.* Cada bloque indica el criterio de evaluación que atiende.

---

## I. Gancho · 0:00 – 0:20 · *relevancia del problema*

*(Pantalla negra. Silencio de tres segundos.)*

El 13 de diciembre del año pasado, de madrugada, el Piraí se desbordó en El Torno.

**Veintiséis personas murieron.** Más de mil trescientas familias lo perdieron todo.

Fue la riada más grande en 42 años.

*(Pausa.)*

La pregunta que guio este proyecto fue: **¿era posible avisar antes?**

---

## II. Lo que descubrimos · 0:20 – 0:55 · *originalidad, viabilidad técnica*

*(Abrir «¿Habría avisado la riada real del 13/12/2025?». Dejar que la gráfica se dibuje.)*

Analizamos los datos abiertos de esa noche: cuatro modelos meteorológicos y el caudal del río.

**Ninguno registró la tormenta.** Veinte milímetros de lluvia. El caudal, sin variación.

*(Señalar la línea gris pegada al piso.)*

Una aplicación basada únicamente en satélites **no habría emitido ninguna alerta.**

Sin embargo, río arriba, en Bermejo y en el río Espejos, **los vecinos sí veían crecer el río.**

*(Señalar la línea naranja que cruza el umbral.)*

Con dos vigías que reporten el crecimiento del río, la alerta se activa **unas cuatro horas antes** del desborde.

*(Si el bot está encendido: reproducir el audio de Telegram de un vigía, «está viniendo turbio, ya tapa la piedra». Aparece en la central «Vigía en Bermejo».)*

Y no necesitan aprender ninguna aplicación: **el vigía manda un audio por Telegram**, una computadora del barrio lo entiende y lo cuenta como reporte.

---

## III. La solución · 0:55 – 2:15 · *funcionamiento, creatividad, propuesta*

*(Cerrar el diálogo. Presionar «Sé guardián» y mostrar el código QR durante diez segundos.)*

Los invitamos a escanear este código: durante la demostración, ustedes serán los guardianes.

*(Cerrar el código. Presionar «Iniciar simulacro».)*

El Río Suena combina cuatro fuentes: **la lluvia de los modelos, los vigías río arriba, la regla pintada en el puente y el aviso oficial de SENAMHI.**

**Primero, asigna una hora a cada barrio.**
No comunica «alerta roja», sino: *«el agua llega a El Torno en 5 horas»*.

*(Señalar la cuenta regresiva.)*

**Segundo, muestra la altura del agua sobre la pared de cada vivienda**, porque muchas familias no evacúan al no creer que el agua alcanzará su casa.

**Tercero, nadie queda olvidado.**
Doña Rosa, que usa silla de ruedas, tiene un vecino guardián: Marcelo.

*(Suena y vibra el celular del guardián. Levantarlo.)*

Marcelo recibe el aviso, la traslada y lo confirma con un toque. La central registra en tiempo real cuánto tardó en responder.

*(Presionar «Ya la ayudé». Si el jurado escaneó el código, señalar sus confirmaciones en pantalla.)*

Sin conexión a internet, el aviso se envía por **SMS o llamada**. Y si nadie confirma 30 minutos antes de la llegada del agua, **el caso se deriva al rescate oficial**.

*(Aparece «Todos a salvo» con los números.)*

---

## IV. Para quién y cómo se implementa · 2:15 – 3:05 · *claridad del público, implementación*

Está dirigido a las familias de la ribera, a las personas que no pueden evacuar por sí mismas y a la **junta vecinal y el COED**, que ven en tiempo real quién falta.

*(Abrir el panel de la junta e ingresar la clave 1312.)*

La junta registra y aprueba a cada persona desde cualquier teléfono, en un registro compartido protegido por clave.

Es una aplicación que **se instala en el celular sin tienda de aplicaciones, funciona sin internet y suena aunque el teléfono esté bloqueado**. No requiere sensores costosos: un teléfono, pintura y vecinos. Además, una PC del equipo vigila la cuenca las 24 horas y deja la última lectura en la nube; si esa PC se apaga, cada celular sigue vigilando por su cuenta.

Proponemos un piloto en **El Torno durante esta temporada de lluvias**: diez vigías, cinco reglas pintadas y cincuenta personas registradas, por aproximadamente **mil quinientos bolivianos**. Para las familias, **el servicio es gratuito**.

Luego, toda la cuenca del Piraí. Y después, **todo el país**: el Mamoré en el Beni, el Rocha en Cochabamba, los ríos de La Paz. Los datos abiertos cubren todo el territorio y las juntas vecinales ya existen en cada municipio: **solo cambia el mapa.**

*(Si el tiempo lo permite:)* En la temporada pasada, las lluvias afectaron a **más de ciento ochenta y seis mil familias** en Bolivia.

---

## V. Cierre · 3:05 – 3:30 · *impacto*

No reemplazamos la alerta oficial: **leemos cada día el boletín de SENAMHI y lo llevamos hasta cada barrio, con minutos, nombres y vecinos.**

El 13 de diciembre, el río sonó, y nadie lo estaba escuchando.

*(Pausa.)*

Cuando el río suena…
**el barrio responde.**

Muchas gracias.

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
Sí. Se instala desde el navegador («Instalar como app»), sin Play Store, recuerda la comunidad de cada vecino y, con la app gratuita ntfy, suena aunque la pantalla esté apagada. Quien no quiere ser guardián puede entrar solo a mirar el río de su barrio.

**«¿Quién paga esto?»**
Para las familias es gratuito. El piloto cuesta aproximadamente Bs 1.500; posteriormente, el municipio y la Gobernación financian el servicio por tramo de río, con apoyo de la cooperación internacional.

---

## Lista de verificación previa (presentación virtual)

- [ ] Compartir **la pestaña del navegador**, no toda la pantalla, y con el audio de la pestaña activado (para que se oiga la sirena)
- [ ] Botón verde **«Sé guardián»**: mostrar el QR 10 s e invitar al jurado a escanearlo antes de lanzar el simulacro
- [ ] Un celular propio ya con «Activar avisos», para que se vea sonar en cámara
- [ ] Probar la videollamada 10 min antes (micrófono, cámara, compartir)

- [ ] Volumen del parlante al máximo y probado
- [ ] La página abierta con HTTPS (Pages), ya instalada como app por si falla el wifi
- [ ] Video de respaldo listo: `capturas/demo-respaldo.mp4`
- [ ] La PC de Rodrigo encendida y subiendo lecturas: la fuente del Vigía debe decir **«vigía central (PC del equipo)»**
- [ ] Bot de Telegram encendido (`nodo/`) y un audio de vigía grabado listo para mandar; si falla, usar el botón «Vigía río arriba»
- [ ] En el discurso mostrar solo **dos** cosas nuevas: el audio del vigía y la cuenta regresiva; lo demás, para las preguntas
- [ ] Ensayado con cronómetro: **menos de 3:45** (son 4 min + 3 de preguntas)
- [ ] Tono respetuoso al referirse a las víctimas del 13/12/2025: son la razón del proyecto
