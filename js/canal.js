// Canal entre la central y los celulares de los guardianes.
// ntfy del nodo comunitario (si está configurado) + ntfy.sh público como respaldo + BroadcastChannel en la misma compu.
// Se escucha y se publica en todos a la vez: si el servidor de la comunidad se cae, los avisos siguen por ntfy.sh,
// y los duplicados se descartan por uid. Un tema público no es privado: en producción va solo el servidor propio.
import { NTFY_PROPIO } from './config.js';
const PUBLICO = 'https://ntfy.sh/';
const conBarra = u => u.replace(/\/*$/, '/');
/** Servidores ntfy en orden: el propio (de ?ntfy= o de config.js) y después ntfy.sh. Solo https, o http en localhost. */
export function basesNtfy(param = '', propio = NTFY_PROPIO) {
  const ok = u => { try { const x = new URL(u); return x.protocol === 'https:' || (x.protocol === 'http:' && /^(localhost|127\.)/.test(x.hostname)); } catch { return false; } };
  const l = [param, propio].filter(Boolean).filter(ok).map(conBarra);
  return [...new Set([...l, PUBLICO])];
}
const BASES = basesNtfy(typeof location === 'object' ? new URLSearchParams(location.search).get('ntfy') || '' : '');
const MAX_VISTOS = 200;          // memoria acotada para no repetir mensajes
const ENVIO_MS = 6000;           // un POST colgado no debe trabar la interfaz
const REINTENTO_MIN = 3000, REINTENTO_MAX = 60000;

// ntfy acepta temas de 1 a 64 caracteres [A-Za-z0-9_-]; cualquier otra cosa se limpia.
export const limpiarTema = t => String(t || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
const temaNuevo = () => 'rio-suena-' + Math.random().toString(36).slice(2, 10);

export function temaDemo() {
  const p = limpiarTema(new URLSearchParams(location.search).get('t'));
  if (p) return p;
  try {
    let t = limpiarTema(localStorage.getItem('rio-suena-tema'));
    if (!t) { t = temaNuevo(); localStorage.setItem('rio-suena-tema', t); }
    return t;
  } catch { return temaNuevo(); }
}

// Los datos viajan en las etiquetas (tags) para que el texto de la notificación sea legible en la app ntfy.
export const aTags = d => ['rs', ...Object.entries(d).filter(([, v]) => v != null).map(([k, v]) => `${k}=${Array.isArray(v) ? v.join('+') : v}`)];
export function deTags(tags) {
  if (!Array.isArray(tags) || !tags.includes('rs')) return null;
  const d = {};
  tags.forEach(t => { if (typeof t !== 'string') return; const i = t.indexOf('='); if (i > 0) d[t.slice(0, i)] = t.slice(i + 1); });
  if (d.ids) d.ids = d.ids.split('+');
  return d;
}

/** Conjunto con tope: olvida los más viejos (evita que crezca sin fin en una demo larga). */
export function memoriaAcotada(max = MAX_VISTOS) {
  const s = new Set();
  return {
    has: k => s.has(k),
    add(k) { s.add(k); if (s.size > max) s.delete(s.values().next().value); },
    get size() { return s.size; },
  };
}

export function abrirCanal(tema, alRecibir) {
  tema = limpiarTema(tema);
  const bc = typeof BroadcastChannel === 'function' && tema ? new BroadcastChannel(tema) : null;
  const vistos = memoriaAcotada();
  const entregar = m => { if (!m?.uid || vistos.has(m.uid)) return; vistos.add(m.uid); try { alRecibir(m); } catch (e) { console.error(e); } };
  if (bc) bc.onmessage = e => entregar(e.data);

  // EventSource reintenta solo cada ~3 s para siempre: sin internet eso llena la consola.
  // Aquí se reconecta a mano con espera creciente y se pausa si el navegador está offline.
  let cerrado = false;
  const suscribir = base => {
    let es = null, espera = REINTENTO_MIN, timer = null;
    const conectar = () => {
      clearTimeout(timer); timer = null;
      if (cerrado || !tema || typeof EventSource !== 'function') return;
      if (navigator.onLine === false) return; // se retoma con el evento 'online'
      try { es = new EventSource(`${base}${tema}/sse?since=30s`); } catch { return programar(); }
      es.onopen = () => { espera = REINTENTO_MIN; };
      es.onmessage = e => {
        try {
          const d = JSON.parse(e.data); const m = deTags(d.tags);
          if (d.event === 'message' && m) entregar({ ...m, uid: m.uid || d.id, titulo: d.title, texto: d.message });
        } catch { /* mensaje ajeno al formato */ }
      };
      es.onerror = () => { es?.close(); es = null; programar(); };
    };
    const programar = () => {
      if (cerrado || timer) return;
      timer = setTimeout(conectar, espera); espera = Math.min(REINTENTO_MAX, espera * 2);
    };
    conectar();
    return { enLinea() { espera = REINTENTO_MIN; if (!es) conectar(); }, cerrar() { clearTimeout(timer); es?.close(); es = null; } };
  };
  const subs = BASES.map(suscribir);
  const enLinea = () => subs.forEach(s => s.enLinea());
  addEventListener('online', enLinea);

  const cerrar = () => {
    cerrado = true; subs.forEach(s => s.cerrar()); bc?.close();
    removeEventListener('online', enLinea); removeEventListener('pagehide', cerrar);
  };
  addEventListener('pagehide', cerrar);

  return {
    /** datos: {tipo, ...} · aviso: {titulo, texto, prioridad, acciones}. Entrega local inmediata; ntfy en segundo plano. */
    enviar(datos, aviso = {}) {
      const uid = Math.random().toString(36).slice(2, 9);
      const m = { ...datos, uid, titulo: aviso.titulo, texto: aviso.texto };
      vistos.add(uid);
      try { bc?.postMessage(m); } catch { /* canal ya cerrado */ }
      const cuerpo = JSON.stringify({ topic: tema, title: aviso.titulo, message: aviso.texto || ' ', tags: aTags({ ...datos, uid }), priority: aviso.prioridad || 3, actions: aviso.acciones });
      const uno = async base => {
        const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ENVIO_MS);
        try { return (await fetch(base, { method: 'POST', signal: ctl.signal, body: cuerpo })).ok; }
        catch { return false; /* ese servidor no responde: queda el otro y el canal local */ }
        finally { clearTimeout(t); }
      };
      // true si llegó a algún servidor (el propio o ntfy.sh)
      const red = cerrado || navigator.onLine === false ? Promise.resolve(false)
        : Promise.all(BASES.map(uno)).then(r => r.some(Boolean));
      return Object.assign(m, { red });
    },
    cerrar,
  };
}
