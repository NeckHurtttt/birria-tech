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

async function rpc(fn, cuerpo) {
  if (!hayNube()) throw Error('sin configuración');
  if (navigator.onLine === false) throw Error('sin internet');
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ESPERA_MS);
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST', signal: ctl.signal,
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
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
