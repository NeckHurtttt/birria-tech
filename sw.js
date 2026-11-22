// El Río Suena funciona sin internet: la app, el último escaneo y el mapa ya visto quedan guardados.
// En una crecida el internet suele caerse justo cuando más se necesita.
const VERSION = 'rs-v28';
const APP = ['./', 'index.html', 'guardian.html', 'vigia.html', 'estilo.css', 'icono.svg', 'icono-192.png', 'icono-512.png', 'manifest.webmanifest', 'movil.webmanifest',
  "js/app.js",  "js/canal.js",  "js/cauce-pirai.js",  "js/datos.js",  "js/historico.js",  "js/lluvia.js",  "js/mapa.js",  "js/oido.js",  "js/pared.js",  "js/registro.js",  "js/nube.js",  "js/config.js",  "js/idioma.js",  "js/senamhi.js",  "js/mensajes.js",  "js/chat-textos.js",  "vendor/fuentes.css",  "vendor/fuentes/jetbrains-mono-latin-400-normal.woff2",  "vendor/fuentes/jetbrains-mono-latin-600-normal.woff2",  "vendor/fuentes/space-grotesk-latin-400-normal.woff2",  "vendor/fuentes/space-grotesk-latin-500-normal.woff2",  "vendor/fuentes/space-grotesk-latin-600-normal.woff2",  "vendor/fuentes/space-grotesk-latin-700-normal.woff2",  "vendor/maplibre-gl.css",  "vendor/maplibre-gl.js",  "vendor/qrcode.min.js",
];
const MAX_MAPA = 800; // teselas del mapa guardadas (el tramo del Piraí que ya se miró)

self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(APP)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== 'rs-datos' && k !== 'rs-mapa').map(k => caches.delete(k)))).then(() => self.clients.claim())));

async function recortar(nombre, max) {
  const c = await caches.open(nombre), ks = await c.keys();
  for (const k of ks.slice(0, Math.max(0, ks.length - max))) await c.delete(k);
}
// red primero y, si no hay red, lo último guardado
async function redPrimero(req, nombre) {
  const c = await caches.open(nombre);
  try { const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r; }
  catch { const g = await c.match(req); if (g) return g; throw new Error('sin red'); }
}
// guardado primero y se actualiza por detrás
async function guardadoPrimero(req, nombre, max) {
  const c = await caches.open(nombre), g = await c.match(req);
  const red = fetch(req).then(r => { if (r.ok) { c.put(req, r.clone()); if (max) recortar(nombre, max); } return r; }).catch(() => null);
  return g || (await red) || Response.error();
}

self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || /ntfy\.sh$/.test(u.hostname)) return; // los avisos siempre en vivo
  if (/open-meteo\.com$/.test(u.hostname)) return e.respondWith(redPrimero(req, 'rs-datos'));
  if (/openfreemap\.org$/.test(u.hostname)) return e.respondWith(guardadoPrimero(req, 'rs-mapa', MAX_MAPA));
  if (u.origin === location.origin) return e.respondWith(redPrimero(req, VERSION));
});
