// Canal entre la central y los celulares de los guardianes.
// ntfy.sh (pub/sub público, sin cuenta) + BroadcastChannel como respaldo en la misma compu.
// Solo para la demo: un tema público no es privado; en producción va con servidor propio.
const BASE = 'https://ntfy.sh/';

export function temaDemo() {
  const p = new URLSearchParams(location.search).get('t');
  if (p) return p;
  try {
    let t = localStorage.getItem('rio-suena-tema');
    if (!t) { t = 'rio-suena-' + Math.random().toString(36).slice(2, 10); localStorage.setItem('rio-suena-tema', t); }
    return t;
  } catch { return 'rio-suena-' + Math.random().toString(36).slice(2, 10); }
}

// Los datos viajan en las etiquetas (tags) para que el texto de la notificación sea legible en la app ntfy.
export const aTags = d => ['rs', ...Object.entries(d).map(([k, v]) => `${k}=${Array.isArray(v) ? v.join('+') : v}`)];
export function deTags(tags = []) {
  if (!tags.includes('rs')) return null;
  const d = {};
  tags.forEach(t => { const i = t.indexOf('='); if (i > 0) d[t.slice(0, i)] = t.slice(i + 1); });
  if (d.ids) d.ids = d.ids.split('+');
  return d;
}

export function abrirCanal(tema, alRecibir) {
  const bc = 'BroadcastChannel' in window ? new BroadcastChannel(tema) : null;
  const vistos = new Set();
  const entregar = m => { if (!m?.uid || vistos.has(m.uid)) return; vistos.add(m.uid); alRecibir(m); };
  if (bc) bc.onmessage = e => entregar(e.data);
  let es;
  try {
    es = new EventSource(`${BASE}${tema}/sse?since=30s`);
    es.onmessage = e => { try { const d = JSON.parse(e.data); const m = deTags(d.tags); if (d.event === 'message' && m) entregar({ ...m, uid: m.uid || d.id, titulo: d.title, texto: d.message }); } catch {} };
  } catch {}
  return {
    /** datos: {tipo, ...} · aviso: {titulo, texto, prioridad, acciones} */
    async enviar(datos, aviso = {}) {
      const uid = Math.random().toString(36).slice(2, 9);
      const m = { ...datos, uid, titulo: aviso.titulo, texto: aviso.texto };
      vistos.add(uid); bc?.postMessage(m);
      try {
        await fetch(BASE, { method: 'POST', body: JSON.stringify({ topic: tema, title: aviso.titulo, message: aviso.texto || ' ', tags: aTags({ ...datos, uid }), priority: aviso.prioridad || 3, actions: aviso.acciones }) });
      } catch { /* sin internet: queda el canal local */ }
      return m;
    },
    cerrar() { bc?.close(); es?.close(); },
  };
}
