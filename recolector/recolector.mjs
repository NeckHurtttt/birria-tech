// El Río Suena · vigía central. Corre en una PC del equipo (Windows o Linux) cada 10 min:
// escanea la cuenca alta (misma lógica que la app), calcula el riesgo y sube la lectura a Supabase.
// Si se cae internet guarda en pendientes.jsonl y lo sube después. Nunca termina con error.
//   node recolector/recolector.mjs --una-vez     (lo que ejecuta la Tarea programada)
//   node recolector/recolector.mjs               (bucle cada 10 min, para probar)
import { readFileSync, writeFileSync, appendFileSync, existsSync, statSync, renameSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { escanear } from '../js/lluvia.js';
import { indiceRiesgo } from '../js/datos.js';
import { SUPABASE_URL, SUPABASE_KEY } from '../js/config.js';
import { filaLectura, vigiaCentral } from '../js/nube.js';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RUTA = n => join(AQUI, n);
const MAX_LOG = 5 * 1024 * 1024, MAX_PEND = 500;

export function leerEnv(texto) {
  const o = {};
  for (const linea of texto.split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/); if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return o;
}
function log(msg) {
  const l = `${new Date().toISOString()} ${msg}\n`; process.stdout.write(l);
  try { if (existsSync(RUTA('registro.log')) && statSync(RUTA('registro.log')).size > MAX_LOG) renameSync(RUTA('registro.log'), RUTA('registro.log.1')); appendFileSync(RUTA('registro.log'), l); } catch {}
}
const leerJson = (n, d) => { try { return JSON.parse(readFileSync(RUTA(n), 'utf8')); } catch { return d; } };

/** Decide si mandar alerta por ntfy: solo al ENTRAR en alerta (no cada 10 min). */
export function debeAvisar(estadoAnterior, estadoNuevo) { return estadoNuevo === 'alerta' && estadoAnterior !== 'alerta'; }

async function avisarNtfy(tema, fila) {
  if (!tema) return;
  await fetch('https://ntfy.sh/', { method: 'POST', body: JSON.stringify({
    topic: tema, priority: 5, tags: ['rs', 'tipo=central', 'warning'],
    title: 'El Río Suena: ALERTA de crecida del Piraí',
    message: `Riesgo ${fila.indice}/100. Lluvia cuenca alta ${fila.ll6} mm (6 h). Abran la app y avisen a su vecino.`,
  }) });
}

export async function unaVez() {
  const env = existsSync(RUTA('.env')) ? leerEnv(readFileSync(RUTA('.env'), 'utf8')) : {};
  const cfg = { url: SUPABASE_URL, key: SUPABASE_KEY, recolector: env.RECOLECTOR, token: env.TOKEN };
  if (!cfg.recolector || !cfg.token) { log('falta RECOLECTOR o TOKEN en recolector/.env (ver .env.ejemplo)'); return; }

  let l = await escanear();
  for (let i = 0; !l.vivo && i < 2; i++) { // Open-Meteo a veces tarda más de 6 s: reintentar antes de rendirse
    log('Open-Meteo no respondió, reintento en 20 s'); await new Promise(r => setTimeout(r, 20_000)); l = await escanear();
  }
  const idx = indiceRiesgo({ ll6: l.ll6, ll24: l.ll24, prox6: l.prox6, caudal: l.caudalPico });
  const fila = filaLectura(l, idx);
  log(`lectura: riesgo ${fila.indice} (${fila.estado}) · ll6 ${fila.ll6} mm · caudal ${fila.caudal_pico} m³/s · ${l.fuente}`);
  if (!l.vivo) { log('sin datos en vivo (¿sin internet?): no se sube el respaldo'); return; }

  const estado = leerJson('estado.json', {});
  if (debeAvisar(estado.ultimo, fila.estado)) {
    try { await avisarNtfy(env.NTFY_TEMA, fila); log('ALERTA enviada por ntfy'); } catch (e) { log('ntfy falló: ' + e.message); }
  }
  writeFileSync(RUTA('estado.json'), JSON.stringify({ ultimo: fila.estado, en: fila.medido_en }));

  // primero lo pendiente (más viejo), después lo nuevo
  const pend = existsSync(RUTA('pendientes.jsonl')) ? readFileSync(RUTA('pendientes.jsonl'), 'utf8').split('\n').filter(Boolean).map(x => JSON.parse(x)) : [];
  // el servidor acepta 1 lectura por minuto: por vuelta se suben como mucho 8 (la tarea corre cada 10 min)
  const todo = [...pend, fila], cola = todo.slice(-8), quedan = todo.slice(0, -8);
  for (const [i, f] of cola.entries()) {
    if (i) await new Promise(r => setTimeout(r, 61_000));
    try { await vigiaCentral.subir(cfg, f); }
    catch (e) {
      if (/Could not find the function|schema cache/.test(e.message)) { log('Supabase aún no tiene rs_subir_lectura: falta correr supabase/esquema.sql'); quedan.push(...cola.slice(i)); break; }
      if (/recolector o token incorrecto/.test(e.message)) { log('Supabase rechazó el token: revisa RECOLECTOR y TOKEN'); quedan.push(...cola.slice(i)); break; }
      else if (/seguido/.test(e.message)) { /* ya hay una lectura de este minuto: se descarta */ }
      else { log('no se pudo subir (' + e.message + '), queda pendiente'); quedan.push(f); }
    }
  }
  if (quedan.length) writeFileSync(RUTA('pendientes.jsonl'), quedan.slice(-MAX_PEND).map(x => JSON.stringify(x)).join('\n') + '\n');
  else if (existsSync(RUTA('pendientes.jsonl'))) unlinkSync(RUTA('pendientes.jsonl'));
  if (!quedan.length) log('subida ok');
}

const principal = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (principal) {
  const vuelta = () => unaVez().catch(e => log('error: ' + (e?.message || e)));
  if (process.argv.includes('--una-vez')) await vuelta();
  else { await vuelta(); setInterval(vuelta, 10 * 60 * 1000); }
}
