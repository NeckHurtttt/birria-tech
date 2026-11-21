// Núcleo del recolector: funciones sin efectos de red, para poder probarlas en pruebas.mjs.
// Reutiliza la lógica de la app (js/datos.js, js/canal.js); no la copia.
import fs from 'node:fs';
import path from 'node:path';
import { indiceRiesgo, UMBRAL_ALERTA, BARRIOS, minutosHasta, LAG_CUENCA_MIN, formatoTiempo } from '../js/datos.js';
import { aTags, limpiarTema } from '../js/canal.js';

const r1 = x => Math.round(x * 10) / 10;

/**
 * Fila para rs_lecturas a partir de un escaneo de js/lluvia.js.
 * El caudal guardado es el pico de los próximos días (el mismo que usa la app para el índice).
 * Devuelve null si el escaneo no tiene datos reales (escanear() devuelve un respaldo inventado sin internet).
 */
export function calcularFila(lectura, ahora = new Date(), origen = 'pc') {
  if (!lectura?.vivo) return null;
  // si una de las dos APIs falló, esa parte es el valor de respaldo de lluvia.js: se marca la fila como parcial
  const marcado = 'lluviaVivo' in lectura || 'caudalVivo' in lectura;
  if (marcado && !(lectura.lluviaVivo && lectura.caudalVivo)) origen += '-parcial';
  const caudal = lectura.caudalPico ?? lectura.caudal ?? 0;
  const idx = indiceRiesgo({ ll6: lectura.ll6, ll24: lectura.ll24, prox6: lectura.prox6, caudal });
  return {
    creado_en: ahora.toISOString(),
    ll6: r1(lectura.ll6), ll24: r1(lectura.ll24), prox6: r1(lectura.prox6), prox24: r1(lectura.prox24 ?? 0),
    caudal: r1(caudal),
    indice: Math.round(idx.r * 100),
    nivel: idx.estado,
    // minutos estimados hasta cada barrio si la crecida empezara ahora (lluvia en la cuenca alta → La Angostura → barrio)
    barrios: BARRIOS.map(b => ({ id: b.id, nombre: b.nombre, km: b.km, minutos: minutosHasta(b, idx.intensidad, LAG_CUENCA_MIN) })),
    origen,
  };
}

/** ¿Hay que publicar el aviso? Una sola vez por evento: se rearma cuando el índice baja con margen (histéresis). */
export const REARME = UMBRAL_ALERTA - 0.1;
export function decidirAlerta(estado = {}, indice) {
  const r = indice / 100;
  if (r >= UMBRAL_ALERTA && !estado.alertaActiva) return { publicar: true, estado: { ...estado, alertaActiva: true, desde: new Date().toISOString() } };
  if (r < REARME && estado.alertaActiva) return { publicar: false, estado: { ...estado, alertaActiva: false, desde: null } };
  return { publicar: false, estado };
}

/** Mensaje para ntfy en el mismo formato que js/canal.js (la central y la app ntfy lo entienden). */
export function mensajeAlerta(fila, tema) {
  const torno = fila.barrios.find(b => b.id === 'eltorno');
  const uid = Math.random().toString(36).slice(2, 9);
  return {
    topic: limpiarTema(tema),
    title: `El Río Suena: riesgo ${fila.indice}/100 en la cuenca del Piraí`,
    message: `Lluvia fuerte en la cuenca alta (${fila.ll6} mm en 6 h). El agua llegaría a El Torno en unos ${torno ? formatoTiempo(torno.minutos) : '?'}. Aviso del vigía central (PC del equipo).`,
    tags: aTags({ tipo: 'lectura', indice: fila.indice, nivel: fila.nivel, origen: fila.origen, uid }),
    priority: 5,
  };
}

// ---------- cola de pendientes (una fila JSON por línea) ----------
export function encolar(archivo, fila) {
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  fs.appendFileSync(archivo, JSON.stringify(fila) + '\n');
}
export function leerCola(archivo) {
  try {
    return fs.readFileSync(archivo, 'utf8').split('\n').filter(Boolean).flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } });
  } catch { return []; }
}
/** Sube en orden; lo que falla queda en la cola (y lo de después también, para no desordenar). */
export async function vaciarCola(archivo, subir) {
  const filas = leerCola(archivo);
  let subidas = 0;
  for (; subidas < filas.length; subidas++) {
    try { await subir(filas[subidas]); } catch { break; }
  }
  const quedan = filas.slice(subidas);
  if (quedan.length) fs.writeFileSync(archivo, quedan.map(f => JSON.stringify(f)).join('\n') + '\n');
  else { try { fs.unlinkSync(archivo); } catch {} }
  return { subidas, quedan: quedan.length };
}

// ---------- registro con rotación ----------
export function registrar(archivo, texto, max = 5 * 1024 * 1024) {
  try {
    if (fs.existsSync(archivo) && fs.statSync(archivo).size > max) fs.renameSync(archivo, archivo + '.1');
    fs.appendFileSync(archivo, `${new Date().toISOString()} ${texto}\n`);
  } catch { /* el registro nunca debe tumbar el proceso */ }
}

/** .env sencillo: CLAVE=valor, # comentarios. */
export function leerEnv(archivo) {
  const o = {};
  try {
    for (const l of fs.readFileSync(archivo, 'utf8').split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
  return o;
}
