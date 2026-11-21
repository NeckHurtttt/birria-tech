// Registro compartido en Supabase (solo funciones RPC; las tablas no se leen directo con la clave pública).
// Si no hay internet o no hay configuración, todo sigue funcionando con el registro local.
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const CLAVE_JUNTA = 'rs-junta-clave';
const ESPERA_MS = 8000;

export const comunidad = (() => {
  const c = new URLSearchParams(globalThis.location?.search || '').get('c');
  return /^[a-z0-9-]{3,40}$/.test(c || '') ? c : 'demo';
})();
export const hayNube = () => !!(SUPABASE_URL && SUPABASE_KEY);

export const claveJunta = {
  leer() { try { return sessionStorage.getItem(CLAVE_JUNTA) || ''; } catch { return ''; } },
  poner(v) { try { v ? sessionStorage.setItem(CLAVE_JUNTA, v) : sessionStorage.removeItem(CLAVE_JUNTA); } catch {} },
};

async function rpc(fn, cuerpo, url = SUPABASE_URL, key = SUPABASE_KEY) {
  if (!url || !key) throw Error('sin configuración');
  if (globalThis.navigator?.onLine === false) throw Error('sin internet');
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ESPERA_MS);
  try {
    const r = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: 'POST', signal: ctl.signal,
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) throw Error(j?.message || `error ${r.status}`);
    return j;
  } finally { clearTimeout(t); }
}

export const nube = {
  registrar: p => rpc('rs_registrar', { p_comunidad: comunidad, p }),
  listar: clave => rpc('rs_listar', { p_comunidad: comunidad, p_clave: clave }),
  aprobar: (clave, id, si = true) => rpc('rs_aprobar', { p_comunidad: comunidad, p_clave: clave, p_id: id, p_aprobado: si }),
  quitar: (clave, id) => rpc('rs_quitar', { p_comunidad: comunidad, p_clave: clave, p_id: id }),
};

// ---------- Vigía central (PC del equipo que escanea la cuenca cada 10 min; ver recolector/) ----------
export const FRESCA_MIN = 20; // una lectura más vieja que esto no se usa: el navegador escanea solo

/** Fila que sube el recolector. `l` es lo que devuelve escanear() de js/lluvia.js. */
export function filaLectura(l, idx, ahora = new Date()) {
  const n = x => Math.round((Number(x) || 0) * 10) / 10;
  return {
    medido_en: ahora.toISOString(), ll6: n(l.ll6), ll24: n(l.ll24), prox6: n(l.prox6), prox24: n(l.prox24),
    caudal: l.caudal == null ? null : n(l.caudal), caudal_pico: l.caudalPico == null ? null : n(l.caudalPico),
    indice: Math.max(0, Math.min(100, Math.round(idx.r * 100))), estado: idx.estado,
    puntos: (l.puntos || []).map(p => ({ nombre: p.nombre, ll24: n(p.ll24) })), vivo: !!l.vivo,
  };
}

/** Convierte la fila de Supabase al formato de escanear(); null si no hay o está vieja. */
export function deLectura(f, ahora = Date.now()) {
  if (!f || !f.medido_en) return null; // la hora de la medición, no la de subida (puede venir de pendientes)
  const min = (ahora - new Date(f.medido_en).getTime()) / 6e4;
  if (!(min >= -5 && min <= FRESCA_MIN)) return null;
  return {
    ll6: f.ll6, ll24: f.ll24, mm24: f.ll24, prox6: f.prox6, prox24: f.prox24 ?? 0,
    caudal: f.caudal ?? 0, caudalPico: f.caudal_pico ?? f.caudal ?? 0,
    puntos: f.puntos || [], vivo: f.vivo !== false, central: true, minutos: Math.max(0, Math.round(min)),
    fuente: 'vigía central (PC del equipo)',
  };
}

export const vigiaCentral = {
  ultima: () => rpc('rs_ultima_lectura', {}),
  /** Para el recolector (Node): url/key públicas + nombre y token de la PC. */
  subir: ({ url, key, recolector, token }, fila) => rpc('rs_subir_lectura', { p_recolector: recolector, p_token: token, p: fila }, url, key),
};
