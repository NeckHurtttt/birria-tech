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

// ---------- lecturas del recolector (PC del equipo, ver recolector/) ----------
// rs_lecturas tiene lectura pública. Si la última es reciente, la app la usa en vez de escanear desde el navegador;
// si la PC está apagada (lectura vieja o ninguna), la app escanea sola como siempre.
export const VIGENCIA_MIN = 20;
export const FUENTE_CENTRAL = 'Vigía central (PC del equipo)';

/** Convierte una fila de rs_lecturas al formato de escanear() (js/lluvia.js). null si es vieja o inválida. */
export function lecturaComoEscaneo(fila, ahora = Date.now()) {
  const t = Date.parse(fila?.creado_en);
  if (!fila || !Number.isFinite(t) || ahora - t > VIGENCIA_MIN * 60000 || ahora - t < -5 * 60000) return null;
  const n = k => Math.max(0, Number(fila[k]) || 0);
  return { ll6: n('ll6'), ll24: n('ll24'), prox6: n('prox6'), prox24: n('prox24'), caudal: n('caudal'), caudalPico: n('caudal'),
    mm24: n('ll24'), puntos: [], vivo: true, fuente: FUENTE_CENTRAL, creado_en: fila.creado_en };
}

export async function ultimaLectura() {
  if (!hayNube() || globalThis.navigator?.onLine === false) return null;
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 6000);
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rs_lecturas?select=*&order=creado_en.desc&limit=1`,
      { signal: ctl.signal, headers: { apikey: SUPABASE_KEY } });
    if (!r.ok) return null; // tabla aún no creada, sin red, etc.: la app escanea sola
    const [fila] = await r.json();
    return lecturaComoEscaneo(fila);
  } catch { return null; } finally { clearTimeout(t); }
}
