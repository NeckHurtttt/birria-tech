// Datos del prototipo. Distancias, velocidades, umbrales y alturas son ESTIMADOS para la demo:
// hay que calibrarlos con SEARPI / COED antes de usarlos de verdad. Todo sale de datos abiertos: no hay hardware.
// Punto de control (solo un lugar del mapa): desde aquí se miden los km río abajo.
export const SENSOR = { id: 'angostura', nombre: 'Punto de control · La Angostura', lon: -63.5405, lat: -18.1727 };

// Cuenca alta del Piraí (río arriba de La Angostura): puntos donde se escanea la lluvia.
export const CUENCA = [
  { nombre: 'Bermejo', lat: -18.16, lon: -63.62 },
  { nombre: 'Cuevas', lat: -18.18, lon: -63.70 },
  { nombre: 'Samaipata', lat: -18.18, lon: -63.87 },
  { nombre: 'Alto Piraí', lat: -18.30, lon: -63.78 },
  { nombre: 'Achira', lat: -18.10, lon: -63.78 },
];
// Caudal modelado GloFAS en La Angostura, 1984–2026 (Open-Meteo Flood API, herramientas/validar.py): referencia para el percentil.
export const CAUDAL_HIST = { mediana: 11.3, p95: 35, max: 80.9 };
export const LAG_CUENCA_MIN = 150; // tiempo estimado de la lluvia en la cuenca alta hasta La Angostura
export const LAG_VIGIA_MIN = 60; // un vigía río arriba (Bermejo / río Espejos) ve la crecida ~1 h antes de La Angostura (estimado)

/**
 * Índice de riesgo 0–1 combinando escaneos y reportes.
 * Tres fuentes pueden disparar la alerta solas: lluvia de modelos abiertos, caudal GloFAS y vigías río arriba
 * (2 reportes independientes). La riada del 13/12/2025 mostró por qué: los modelos globales no vieron la tormenta
 * del Amboró (máx. 3 mm/h), pero los vecinos río arriba sí veían el río crecer.
 * Los reportes de la ribera (crecido / desborde) solo suben el índice: solos no alertan.
 */
// oficial: amenaza de SENAMHI de hoy ('sin'|'amarilla'|'naranja'|'roja'); pone un piso al índice
// (amarilla/naranja = vigilancia, roja = alerta) para no decir "normal" cuando el aviso oficial dice otra cosa.
const PISO_OFICIAL = { sin: 0, amarilla: 0.25, naranja: 0.4, roja: 0.6 };
export function indiceRiesgo({ ll6 = 0, ll24 = 0, prox6 = 0, caudal = 0, crecido = 0, desborde = 0, vigias = 0, oficial = null } = {}) {
  const c = x => Math.min(1, Math.max(0, x));
  const lluvia = Math.max(c((ll6 - 10) / 40), 0.8 * c((ll24 - 25) / 75), 0.7 * c((prox6 - 10) / 40));
  const rio = c((caudal - CAUDAL_HIST.p95) / (CAUDAL_HIST.max * 1.5 - CAUDAL_HIST.p95));
  const vecinos = c(crecido * 0.34 + desborde * 0.6);
  const arriba = c(vigias * 0.5);
  const propio = c(Math.max(lluvia, rio, arriba) * 0.75 + vecinos * 0.35);
  const piso = PISO_OFICIAL[oficial] || 0;
  const r = Math.max(propio, piso);
  const fuente = piso > propio ? 'senamhi' : arriba >= Math.max(lluvia, rio) && arriba > 0 ? 'vigias' : rio > lluvia ? 'rio' : 'lluvia';
  return { r, intensidad: 1 + 3 * r, estado: r >= 0.55 ? 'alerta' : r >= 0.25 ? 'vigilancia' : 'normal', fuente, partes: { lluvia, rio, vecinos, arriba, oficial: piso } };
}
export const UMBRAL_ALERTA = 0.55;

import { CAUCE_PIRAI } from './cauce-pirai.js';
export const CAUCE = CAUCE_PIRAI;
/** índice del cauce más cercano al sensor: desde ahí se miden los km */
export const SENSOR_IDX = CAUCE.reduce((m, p, i) => (Math.hypot(p[0] - SENSOR.lon, p[1] - SENSOR.lat) < Math.hypot(CAUCE[m][0] - SENSOR.lon, CAUCE[m][1] - SENSOR.lat) ? i : m), 0);

export const SINUOSIDAD = 1.05; // el trazado real ya está simplificado

/** km acumulados del cauce desde el sensor hasta cada vértice (0 río arriba del sensor). */
export const KM_CAUCE = (() => {
  const km = CAUCE.map(() => 0);
  for (let i = SENSOR_IDX + 1; i < CAUCE.length; i++) km[i] = km[i - 1] + distKm(CAUCE[i - 1], CAUCE[i]) * SINUOSIDAD;
  return km;
})();
export const KM_TOTAL = KM_CAUCE[KM_CAUCE.length - 1];

// altura de agua esperada (m) con una crecida "fuerte"; km se calcula sobre el cauce.
export const BARRIOS = [
  { id: 'jorochito', nombre: 'Jorochito', lon: -63.425, lat: -18.045, altura: 0.9 },
  { id: 'eltorno', nombre: 'El Torno', lon: -63.385, lat: -17.995, altura: 1.2 },
  { id: 'porongo', nombre: 'Porongo (ribera)', lon: -63.29, lat: -17.86, altura: 0.7 },
  { id: 'urubo', nombre: 'Puente Urubó', lon: -63.215, lat: -17.760, altura: 0.6 },
  { id: 'portachuelo', nombre: 'Portachuelo', lon: -63.26, lat: -17.36, altura: 0.5 },
].map(b => ({ ...b, km: Math.round(kmEnCauce([b.lon, b.lat]) * 10) / 10 }));

export function distKm(a, b) {
  const R = 6371, r = Math.PI / 180, dLat = (b[1] - a[1]) * r, dLon = (b[0] - a[0]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
/** Proyecta un punto sobre el cauce y devuelve los km desde el sensor. */
export function kmEnCauce(p) {
  let mejor = { d: Infinity, km: 0 };
  for (let i = SENSOR_IDX; i < CAUCE.length - 1; i++) {
    const a = CAUCE[i], b = CAUCE[i + 1], dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
    const q = [a[0] + t * dx, a[1] + t * dy], d = distKm(p, q);
    if (d < mejor.d) mejor = { d, km: KM_CAUCE[i] + distKm(a, q) * SINUOSIDAD };
  }
  return mejor.km;
}
/** Punto del cauce a km recorridos desde el sensor (para dibujar la crecida). */
export function tramoHasta(km) {
  const pts = [CAUCE[SENSOR_IDX]];
  for (let i = SENSOR_IDX + 1; i < CAUCE.length; i++) {
    if (KM_CAUCE[i] <= km) { pts.push(CAUCE[i]); continue; }
    const t = (km - KM_CAUCE[i - 1]) / (KM_CAUCE[i] - KM_CAUCE[i - 1]);
    if (t > 0) pts.push([CAUCE[i - 1][0] + (CAUCE[i][0] - CAUCE[i - 1][0]) * t, CAUCE[i - 1][1] + (CAUCE[i][1] - CAUCE[i - 1][1]) * t]);
    break;
  }
  return pts;
}

export const VELOCIDAD_KMH = 7.1; // supuesto de onda de crecida (~2 m/s)

/** Repite la riada real hora por hora: índice solo con modelos abiertos y con 2 vigías río arriba. */
export function repetirRiada(R) {
  const t0 = new Date(R.inicio + ':00-04:00').getTime(), hora = i => new Date(t0 + i * 3.6e6);
  const iso = d => new Date(d.getTime() - 4 * 3.6e6).toISOString().slice(0, 13) + ':00';
  const iDesb = R.lluviaHora.findIndex((_, i) => iso(hora(i)) >= R.desborde);
  // el vigía ve crecer el río cuando a la crecida le falta: vigía → La Angostura → El Torno (crecida rápida = caso conservador)
  const antes = LAG_VIGIA_MIN + minutosHasta(BARRIOS.find(b => b.id === 'eltorno'), 4);
  const iVigia = iDesb - Math.floor(antes / 60);
  const filas = R.lluviaHora.map((mm, i) => {
    const suma = n => R.lluviaHora.slice(Math.max(0, i - n + 1), i + 1).reduce((a, b) => a + b, 0);
    const dia = iso(new Date(hora(i).getTime() - 24 * 3.6e6)).slice(0, 10); // caudal de ayer: el de hoy aún no se conoce
    const base = { ll6: suma(6), ll24: suma(24), caudal: R.caudalDia[dia] ?? Object.values(R.caudalDia)[0] };
    const solo = indiceRiesgo(base), con = indiceRiesgo({ ...base, vigias: iVigia >= 0 && i >= iVigia ? 2 : 0 });
    return { i, hora: iso(hora(i)), mm, solo: solo.r, con: con.r, alertaSolo: solo.estado === 'alerta', alertaCon: con.estado === 'alerta' };
  });
  const primera = k => filas.find(f => f[k]);
  const conA = primera('alertaCon'), soloA = primera('alertaSolo');
  return {
    filas, iDesborde: iDesb, iVigia,
    maxSolo: Math.max(...filas.map(f => f.solo)), lluviaTotal: R.lluviaHora.reduce((a, b) => a + b, 0),
    alertaSolo: soloA ? soloA.hora : null, alertaCon: conA ? conA.hora : null,
    ventajaMin: conA ? (iDesb - conA.i) * 60 : 0, antesMin: antes,
  };
}

// Personas de ejemplo y sus vecinos ayudantes para el simulacro (?jurado). Datos ficticios: los nombres se sortean al abrir la central.
// g: 'f' señora, 'm' señor, 'ninos' hermanos (solo elige de qué lista sale el nombre sorteado)
export const PERSONAS = [
  { id: 'rosa', nombre: 'Doña Rosa', g: 'f', edad: 82, necesidad: 'silla de ruedas', barrio: 'eltorno', cuadra: 'Cuadra 4', guardian: 'Marcelo (vecino)', idioma: 'castellano' },
  { id: 'teo', nombre: 'Don Teodoro', g: 'm', edad: 75, necesidad: 'no oye: aviso en señas', barrio: 'eltorno', cuadra: 'Cuadra 6', guardian: 'Lucía (vecina)', idioma: 'LSB' },
  { id: 'nina', nombre: 'Niños Gutiérrez (3)', g: 'ninos', edad: 9, necesidad: 'solos hasta las 19:00', barrio: 'jorochito', cuadra: 'Cuadra 2', guardian: 'Profe Ana', idioma: 'castellano' },
  { id: 'juana', nombre: 'Doña Juana', g: 'f', edad: 68, necesidad: 'habla quechua', barrio: 'porongo', cuadra: 'Cuadra 1', guardian: 'Rubén (vecino)', idioma: 'quechua' },
];

// Nombres comunes de la ribera para sortear: fáciles de leer en voz alta, una sola palabra cada uno (la traducción de
// «Niños X (N)» y «Familia X» espera una palabra). No incluyen los nombres fijos de antes (Rosa, Teodoro, Juana, Gutiérrez)
// ni los de los mensajes de emergencia; las listas de personas y de ayudantes no se pisan entre sí.
export const NOMBRES_FIJOS = PERSONAS.map(p => p.nombre);
export const NOMBRES_DEMO = {
  f: ['Carmen', 'Beatriz', 'Teresa', 'Gladys', 'Lidia', 'Sonia', 'Marina', 'Nelly', 'Hilda', 'Dora', 'Josefa', 'Benita', 'Elvira', 'Alicia',
    'Isabel', 'Victoria', 'Graciela', 'Norma', 'Silvia', 'Luisa', 'Margarita', 'Antonia', 'Mercedes', 'Esther', 'Blanca', 'Gloria', 'Amalia',
    'Olga', 'Yolanda', 'Delia', 'Irma', 'Celia', 'Leonor', 'Susana', 'Cristina', 'Lourdes', 'Raquel', 'Matilde', 'Julia', 'Rita'],
  m: ['Humberto', 'Enrique', 'Alberto', 'Ernesto', 'Julián', 'Mario', 'Fermín', 'Ramón', 'Gregorio', 'Tomás', 'Lorenzo', 'Aurelio', 'Arturo',
    'Jorge', 'Óscar', 'Raúl', 'Gonzalo', 'Rodolfo', 'Víctor', 'Alfredo', 'Rolando', 'Eduardo', 'Fernando', 'Gustavo', 'Hernán', 'Jaime',
    'Manuel', 'Pedro', 'Ricardo', 'Roberto', 'Antonio', 'Francisco', 'Guillermo', 'Mauricio', 'Efraín', 'Isidoro', 'Severino', 'Faustino'],
  apellidos: ['Vargas', 'Mamani', 'Choque', 'Quispe', 'Peña', 'Rivero', 'Montaño', 'Céspedes', 'Paniagua', 'Zeballos', 'Méndez', 'Velasco',
    'Arandia', 'Quiroga', 'Soliz', 'Aguilera', 'Barba', 'Durán', 'Egüez', 'Hurtado', 'Ibáñez', 'Melgar', 'Moreno', 'Parada', 'Ribera',
    'Salvatierra', 'Terrazas', 'Toledo', 'Zambrana', 'Guzmán', 'Mercado', 'Medina', 'Aguirre', 'Sandoval', 'Torrico', 'Lijerón'],
};
// ayudantes: vecinos más jóvenes; quien cuida a niños solos es «Profe …»
export const NOMBRES_AYUDANTES = {
  f: ['Lucía', 'Ana', 'Paola', 'Daniela', 'Mariela', 'Vanessa', 'Andrea', 'Jimena', 'Fernanda', 'Gabriela', 'Natalia', 'Verónica',
    'Claudia', 'Karina', 'Sandra', 'Lorena', 'Valeria', 'Mónica', 'Roxana', 'Pamela'],
  m: ['Marcelo', 'Rubén', 'Daniel', 'Andrés', 'Carlos', 'Javier', 'Miguel', 'Pablo', 'Esteban', 'Iván', 'Gabriel', 'Mateo', 'Nicolás',
    'Álvaro', 'Cristian', 'Franz', 'Marco', 'Bruno', 'Adrián', 'Joel'],
};
const sorteo = azar => {
  const usados = new Set();
  return lista => { const libres = lista.filter(x => !usados.has(x)); const x = libres[Math.floor(azar() * libres.length) % libres.length]; usados.add(x); return x; };
};
/**
 * Sortea un nombre para cada persona de ejemplo, sin repetir: «Doña …», «Don …», «Niños … (N)» o «Familia …».
 * @returns {Record<string, string>} id → nombre
 */
export function nombresAleatorios(personas = PERSONAS, azar = Math.random) {
  const sacar = sorteo(azar), out = {};
  for (const p of personas) {
    if (p.g === 'ninos') {
      const apellido = sacar(NOMBRES_DEMO.apellidos), forma = azar(), cuantos = 2 + Math.floor(azar() * 3) % 3; // 2 a 4 hermanos
      out[p.id] = forma < 0.6 ? `Niños ${apellido} (${cuantos})` : `Familia ${apellido}`;
    } else out[p.id] = `${p.g === 'm' ? 'Don' : 'Doña'} ${sacar(NOMBRES_DEMO[p.g === 'm' ? 'm' : 'f'])}`;
  }
  return out;
}
/**
 * Sortea el vecino ayudante de cada persona de ejemplo, sin repetir: «Marcelo (vecino)», «Lucía (vecina)»
 * o, para niños solos, «Profe …».
 * @returns {Record<string, string>} id → ayudante
 */
export function ayudantesAleatorios(personas = PERSONAS, azar = Math.random) {
  const sacar = sorteo(azar), out = {};
  for (const p of personas) {
    const mujer = azar() < 0.5, nombre = sacar(NOMBRES_AYUDANTES[mujer ? 'f' : 'm']);
    out[p.id] = p.g === 'ninos' ? `Profe ${nombre}` : `${nombre} (${mujer ? 'vecina' : 'vecino'})`;
  }
  return out;
}
/** Formas válidas de un nombre sorteado y de un ayudante sorteado (para descartar lo guardado de versiones viejas). */
export const NOMBRE_SORTEADO = /^(Doña|Don) \S.{0,30}$|^Niños \S+ \(\d+\)$|^Familia \S+$/;
export const AYUDANTE_SORTEADO = /^\S+ \((vecino|vecina)\)$|^Profe \S+$/;

/** Minutos que tarda la crecida en llegar a un barrio. intensidad 1 = normal, >1 más rápida. */
export const velocidad = (intensidad = 1, vel = VELOCIDAD_KMH) => vel * Math.min(1.6, Math.max(0.8, Math.sqrt(intensidad)));
/** Minutos hasta que la crecida llega al barrio. lag = minutos que tarda en llegar a La Angostura (LAG_CUENCA_MIN si la alerta sale de la lluvia en la cuenca alta, 0 si ya está en el río). */
export function minutosHasta(barrio, intensidad = 1, lag = 0) {
  return Math.round(lag + (barrio.km / velocidad(intensidad)) * 60);
}

/** Altura estimada del agua (m) en un barrio según la intensidad detectada (1–4). */
export function alturaEn(barrio, intensidad = 1) {
  const f = Math.min(1.8, Math.max(0.3, (intensidad - 1) / 2 + 0.5));
  return Math.round(barrio.altura * f * 100) / 100;
}

export function formatoTiempo(min) {
  if (min <= 0) return 'ya llegó';
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`;
}

/** Qué tan respaldada está la alerta por la lluvia real. */
export function confianza(mm24, intensidad) {
  if (mm24 >= 20) return { nivel: 'alta', texto: `Confirmado: ${mm24.toFixed(0)} mm de lluvia río arriba en 24 h` };
  if (mm24 >= 5 || intensidad >= 3) return { nivel: 'media', texto: `Lluvia moderada río arriba (${mm24.toFixed(0)} mm). Pedimos foto de la regla.` };
  return { nivel: 'baja', texto: `Casi sin lluvia río arriba (${mm24.toFixed(0)} mm): posible falsa alarma, se pide confirmar con foto.` };
}

/** Nivel leído en una regla pintada: y de la marca 0 m, y de la marca tope (m), y del agua. */
export function nivelDeRegla(y0, yTope, metrosTope, yAgua) {
  const pxPorM = (y0 - yTope) / metrosTope;
  if (!(pxPorM > 0)) return null;
  return Math.max(0, Math.round(((y0 - yAgua) / pxPorM) * 100) / 100);
}
