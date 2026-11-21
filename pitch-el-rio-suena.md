# 🎤 El Río Suena — Discurso del pitch

> **Duración:** 3 min 30 s (la guía da 4 min + 3 de preguntas) · **En escena:** quien habla + quien opera la demo + el celular del guardián en la mano
> *Las acotaciones en cursiva no se leen en voz alta.* Cada bloque dice qué criterio del jurado cubre.

---

## I. Gancho · 0:00 – 0:20 · *relevancia del problema*

*(Pantalla negra. Silencio de tres segundos.)*

El 13 de diciembre del año pasado, de madrugada, el Piraí se desbordó en El Torno.

**Veintiséis personas murieron.** Más de mil trescientas familias lo perdieron todo.

Fue la riada más grande en 42 años.

*(Pausa.)*

Y la pregunta que nos hicimos fue: **¿se podía avisar antes?**

---

## II. Lo que descubrimos · 0:20 – 0:55 · *originalidad, viabilidad técnica*

*(Abrir «¿Habría avisado la riada real del 13/12/2025?». Dejar que la gráfica se dibuje.)*

Bajamos los datos abiertos de esa noche: cuatro modelos del clima y el caudal del río.

**Ninguno vio la tormenta.** Veinte milímetros. El caudal, plano.

*(Señalar la línea gris pegada al piso.)*

Si hubiéramos hecho la app que todos hacen —una que solo lee satélites—, **no habría avisado.**

Pero río arriba, en Bermejo y en el río Espejos, **la gente sí veía crecer el río.**

*(Señalar la línea naranja que cruza el umbral.)*

Con dos vecinos que reporten «el río creció», la alerta salta **unas cuatro horas antes** del desborde.

---

## III. La solución · 0:55 – 2:15 · *funcionamiento, creatividad, propuesta*

*(Cerrar el diálogo. Tocar «Iniciar simulacro».)*

El Río Suena junta tres ojos: **la lluvia de los modelos, los vigías río arriba y la regla pintada en el puente.**

**Uno: le pone hora a cada barrio.**
No dice «alerta roja». Dice: *«el agua llega a El Torno en 5 horas»*.

*(Señalar la cuenta regresiva.)*

**Dos: te muestra el agua en tu pared**, porque mucha gente no evacúa porque no cree que el agua llegue a su casa.

**Tres: nadie queda olvidado.**
Doña Rosa, en silla de ruedas, tiene un vecino guardián: Marcelo.

*(Suena y vibra el celular del guardián. Levantarlo.)*

Marcelo recibe el aviso, la ayuda y confirma con un toque.

*(Tocar «Ya la ayudé».)*

Si no hay internet, sale un **SMS o una llamada** con un toque. Y si nadie confirma 30 minutos antes del agua, **pasa al rescate oficial**.

*(Aparece «Todos a salvo» con los números.)*

---

## IV. Para quién y cómo se implementa · 2:15 – 3:05 · *claridad del público, implementación*

Es para las familias de la ribera, para quien no puede salir solo… y para la **junta vecinal y el COED**, que ven en vivo quién falta.

*(Abrir «Panel de la junta / COED» dos segundos.)*

Es una web que **se instala sin tienda y funciona sin internet**. No necesita sensores caros: un celular, pintura y vecinos.

El piloto: **El Torno, esta temporada de lluvias.** Diez vigías, cinco reglas pintadas, cincuenta personas registradas. Unos **mil quinientos bolivianos**. Para las familias, **siempre gratis**.

Después, todo el Piraí. Y después, **todo el país**: el Mamoré en el Beni, el Rocha en Cochabamba, los ríos de La Paz. Los datos abiertos cubren toda Bolivia y las juntas vecinales ya existen en todas partes: **solo cambia el mapa.**

*(Si hay tiempo:)* La temporada pasada, las lluvias afectaron a **más de ciento ochenta mil familias** en Bolivia.

---

## V. Cierre · 3:05 – 3:30 · *impacto*

No reemplazamos la alerta oficial: **le ponemos minutos, nombres y vecinos.**

El 13 de diciembre, el río sonó… y nadie lo estaba escuchando.

*(Pausa.)*

Cuando el río suena…
**el barrio responde.**

Gracias.

---

## 🛡️ Respuestas rápidas para el jurado (20 s cada una)

**«¿Sirve fuera de Santa Cruz?»**
Sí. El río, los puntos de lluvia y los barrios son configuración. Open-Meteo y GloFAS cubren todo el país, y juntas vecinales y Unidades de Gestión de Riesgo hay en cada municipio. Cada río nuevo es un piloto de unos 1.500 Bs.

**«¿Lo probaron en celulares de verdad?»**
Sí, el 21 de noviembre: un Android y un iPhone recibieron la alerta con sirena y confirmaron «a salvo»; la central mostró el tiempo de respuesta. *(Y si quieren, escaneen el QR ahora.)*

**«¿Cómo saben que funciona?»**
Lo probamos con la riada real del 13/12/2025 y con 42 años de caudales. El script está en el repo (`herramientas/validar.py`). Lo honesto: con solo satélites **no** habría avisado; por eso sumamos vigías. La hora del reporte de los vigías es una estimación.

**«¿Y los tiempos y alturas?»**
Son estimaciones del prototipo. En el piloto se calibran con SEARPI y el COED.

**«¿Y las falsas alarmas?»**
Un solo reporte no alerta: hacen falta dos vigías, o lluvia fuerte en la cuenca, o el caudal arriba del percentil 95 de 42 años. Los reportes de la ribera solos dejan la zona en vigilancia.

**«¿Y si se cae el internet?»**
La app queda instalada y abre sin red con la última alerta. Los guardianes reciben SMS o llamada desde un toque.

**«¿Y los datos de las personas vulnerables?»**
Solo los ven su guardián, la junta y el rescate. En producción van en un servidor propio del municipio, nada público.

**«¿En qué se diferencia de Google Flood Hub o de la alerta por colores?»**
Esos pronostican por tramo de río o por departamento. Nosotros avisamos **por barrio, con minutos, con un vecino asignado**, y vemos tormentas locales con personas.

**«¿Quién paga esto?»**
Para las familias es gratis, siempre. El piloto cuesta unos 1.500 Bs; después pagan el municipio y la Gobernación por tramo de río, con apoyo de cooperación.

---

## ✅ Antes de subir al escenario (pitch VIRTUAL)

- [ ] Compartir **la pestaña del navegador**, no toda la pantalla, y con el audio de la pestaña activado (para que se oiga la sirena)
- [ ] Botón verde **«Sé guardián»**: mostrar el QR 10 s e invitar al jurado a escanearlo antes de lanzar el simulacro
- [ ] Un celular propio ya con «Activar avisos», para que se vea sonar en cámara
- [ ] Probar la videollamada 10 min antes (micrófono, cámara, compartir)

- [ ] Volumen del parlante al máximo y probado
- [ ] Celular del guardián con **Activar avisos** ya tocado
- [ ] La página abierta con HTTPS (Pages), ya instalada como app por si falla el wifi
- [ ] Video de respaldo listo: `capturas/demo-respaldo.mp4`
- [ ] Ensayado con cronómetro: **menos de 3:45** (son 4 min + 3 de preguntas)
- [ ] Tono respetuoso al hablar de las víctimas del 13/12/2025: no es un truco, es la razón del proyecto
