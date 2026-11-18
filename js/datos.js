// Datos del prototipo. Distancias, velocidades y alturas son ESTIMADOS para la demo:
// hay que calibrarlos con SEARPI / COED antes de usarlos de verdad.
export const SENSOR = { id: 'angostura', nombre: 'Oído del río · Puente La Angostura', lon: -63.5405, lat: -18.1727 };

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

// Guardianes de ejemplo para el simulacro (?jurado). Datos ficticios.
export const PERSONAS = [
  { id: 'rosa', nombre: 'Doña Rosa', edad: 82, necesidad: 'silla de ruedas', barrio: 'eltorno', cuadra: 'Cuadra 4', guardian: 'Marcelo (vecino)', idioma: 'castellano' },
  { id: 'teo', nombre: 'Don Teodoro', edad: 75, necesidad: 'no oye: aviso en señas', barrio: 'eltorno', cuadra: 'Cuadra 6', guardian: 'Lucía (vecina)', idioma: 'LSB' },
  { id: 'nina', nombre: 'Niños Gutiérrez (3)', edad: 9, necesidad: 'solos hasta las 19:00', barrio: 'jorochito', cuadra: 'Cuadra 2', guardian: 'Profe Ana', idioma: 'castellano' },
  { id: 'juana', nombre: 'Doña Juana', edad: 68, necesidad: 'habla quechua', barrio: 'porongo', cuadra: 'Cuadra 1', guardian: 'Rubén (vecino)', idioma: 'quechua' },
];

/** Minutos que tarda la crecida en llegar a un barrio. intensidad 1 = normal, >1 más rápida. */
export function minutosHasta(barrio, intensidad = 1, vel = VELOCIDAD_KMH) {
  const v = vel * Math.min(1.6, Math.max(0.8, Math.sqrt(intensidad)));
  return Math.round((barrio.km / v) * 60);
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

/** Confianza de una alerta según la lluvia real río arriba (mm en 24 h). */
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
