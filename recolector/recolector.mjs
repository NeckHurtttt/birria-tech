// Recolector de El Río Suena: la PC del equipo escanea la cuenca del Piraí cada 10 min y sube la lectura a Supabase.
// La app (GitHub Pages + Supabase) NO depende de esta PC: si se apaga, sigue con el último dato o escanea sola.
//
//   node recolector/recolector.mjs             → corre siempre, una lectura cada 10 min
//   node recolector/recolector.mjs --una-vez   → una lectura y termina (la usa la Tarea programada de Windows)
//
// Configuración en recolector/.env (ver .env.ejemplo). Nunca subir .env a git.
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { escanear } from '../js/lluvia.js';
import { SUPABASE_URL as URL_APP } from '../js/config.js';
import { calcularFila, decidirAlerta, mensajeAlerta, encolar, vaciarCola, registrar, leerEnv } from './nucleo.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const RUTA = {
  env: path.join(DIR, '.env'),
  log: path.join(DIR, 'registro.log'),
  cola: path.join(DIR, 'pendientes.jsonl'),
  estado: path.join(DIR, 'estado.json'),
};
const ENV = { ...leerEnv(RUTA.env), ...process.env };
const CFG = {
  supabase: (ENV.SUPABASE_URL || URL_APP || '').replace(/\/+$/, ''),
  clave: ENV.SUPABASE_SERVICE_KEY || '',
  tema: ENV.NTFY_TEMA || '',
  ntfy: (ENV.NTFY_URL || 'https://ntfy.sh/').replace(/\/*$/, '/'),
  cadaMin: Number(ENV.CADA_MIN) || 10,
};
const UNA_VEZ = process.argv.includes('--una-vez');
const log = t => { registrar(RUTA.log, t); if (process.stdout.isTTY) console.log(t); };
const espera = ms => new Promise(r => setTimeout(r, ms));

async function conTiempo(url, opciones = {}, ms = 10000) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(url, { ...opciones, signal: ctl.signal }); } finally { clearTimeout(t); }
}

/** Inserta una fila con la clave service_role (la única que puede escribir en rs_lecturas). */
async function subir(fila) {
  if (!CFG.supabase || !CFG.clave) throw Error('falta SUPABASE_SERVICE_KEY en recolector/.env');
  const r = await conTiempo(`${CFG.supabase}/rest/v1/rs_lecturas`, {
    method: 'POST',
    headers: { apikey: CFG.clave, Authorization: `Bearer ${CFG.clave}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(fila),
  });
  if (!r.ok) throw Error(`Supabase ${r.status}: ${(await r.text().catch(() => '')).slice(0, 200)}`);
}

async function publicarAlerta(fila) {
  if (!CFG.tema) { log('alerta: sin NTFY_TEMA, no se publica en ntfy'); return true; }
  const r = await conTiempo(CFG.ntfy, { method: 'POST', body: JSON.stringify(mensajeAlerta(fila, CFG.tema)) });
  if (!r.ok) throw Error(`ntfy ${r.status}`);
  return true;
}

const leerEstado = () => { try { return JSON.parse(fs.readFileSync(RUTA.estado, 'utf8')); } catch { return {}; } };
const guardarEstado = e => { try { fs.writeFileSync(RUTA.estado, JSON.stringify(e)); } catch (err) { log('no se pudo guardar estado: ' + err.message); } };

/** Escanea con reintentos. escanear() devuelve un respaldo inventado si no hay red: eso no cuenta como lectura. */
async function escanearConReintentos(intentos = 3) {
  for (let i = 1; i <= intentos; i++) {
    try {
      const l = await escanear();
      if (l.vivo) return l;
      log(`escaneo ${i}/${intentos}: sin datos en vivo (¿sin internet?)`);
    } catch (e) { log(`escaneo ${i}/${intentos} falló: ${e.message}`); }
    if (i < intentos) await espera(i * 15000);
  }
  return null;
}

async function ciclo() {
  // 1) lo que quedó pendiente de antes
  const prev = await vaciarCola(RUTA.cola, subir);
  if (prev.subidas || prev.quedan) log(`pendientes: ${prev.subidas} subidas, ${prev.quedan} quedan`);

  // 2) lectura nueva
  const lectura = await escanearConReintentos();
  if (!lectura) { log('sin lectura en este ciclo'); return; }
  const fila = calcularFila(lectura);
  log(`lectura: índice ${fila.indice} (${fila.nivel}) · lluvia 6 h ${fila.ll6} mm · caudal ${fila.caudal} m³/s`);
  if (prev.quedan) encolar(RUTA.cola, fila); // hay cola sin subir: se respeta el orden
  else {
    try { await subir(fila); log('subida a Supabase'); }
    catch (e) { encolar(RUTA.cola, fila); log(`no se pudo subir (${e.message}); guardada en pendientes.jsonl`); }
  }

  // 3) aviso en ntfy, una sola vez por evento
  const est = leerEstado(), d = decidirAlerta(est, fila.indice);
  if (d.publicar) {
    try { await publicarAlerta(fila); guardarEstado(d.estado); log(`ALERTA publicada en ntfy (${CFG.tema || 'sin tema'})`); }
    catch (e) { log(`no se pudo publicar la alerta (${e.message}); se reintenta en el próximo ciclo`); }
  } else if (d.estado !== est) { guardarEstado(d.estado); log('índice bajo: alerta rearmada para el próximo evento'); }
}

// Nunca se cae: cualquier error queda en el registro.
process.on('uncaughtException', e => log('error inesperado: ' + (e?.stack || e)));
process.on('unhandledRejection', e => log('error inesperado: ' + (e?.stack || e)));

if (!CFG.clave) log('aviso: falta SUPABASE_SERVICE_KEY en recolector/.env; las lecturas quedan en pendientes.jsonl');
if (UNA_VEZ) {
  await ciclo().catch(e => log('ciclo falló: ' + e.message));
} else {
  log(`recolector en marcha: una lectura cada ${CFG.cadaMin} min`);
  for (;;) {
    await ciclo().catch(e => log('ciclo falló: ' + e.message));
    await espera(CFG.cadaMin * 60000);
  }
}
