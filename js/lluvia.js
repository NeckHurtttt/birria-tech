import { SENSOR, CUENCA } from './datos.js';
const RESPALDO = { ll6: 4, ll24: 38, prox6: 6, prox24: 22, caudal: 7.6, caudalPico: 8.1, fuente: 'respaldo (sin internet)', vivo: false };

async function json(url) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
  try { const r = await fetch(url, { signal: ctl.signal }); return await r.json(); } finally { clearTimeout(t); }
}

/** Suma lluvia por ventanas (h relativas a ahora) para una serie horaria de Open-Meteo. */
function ventanas(h) {
  const ahora = Date.now(), s = { ll6: 0, ll24: 0, prox6: 0, prox24: 0 };
  h.time.forEach((t, i) => {
    const dt = (new Date(t + ':00-04:00').getTime() - ahora) / 3.6e6, p = h.precipitation[i] || 0;
    if (dt > -6 && dt <= 0) s.ll6 += p;
    if (dt > -24 && dt <= 0) s.ll24 += p;
    if (dt > 0 && dt <= 6) s.prox6 += p;
    if (dt > 0 && dt <= 24) s.prox24 += p;
  });
  return s;
}

/**
 * Escaneo de datos abiertos, sin hardware: lluvia en 5 puntos de la cuenca alta (Open-Meteo)
 * y caudal modelado GloFAS en La Angostura (Open-Meteo Flood API). Se toma el peor punto.
 */
export async function escanear() {
  const lat = CUENCA.map(c => c.lat).join(','), lon = CUENCA.map(c => c.lon).join(',');
  const [ll, fl] = await Promise.allSettled([
    json(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation&past_days=1&forecast_days=2&timezone=America%2FLa_Paz`),
    json(`https://flood-api.open-meteo.com/v1/flood?latitude=${SENSOR.lat}&longitude=${SENSOR.lon}&daily=river_discharge&past_days=1&forecast_days=4`),
  ]);
  const r = { ...RESPALDO, puntos: [] };
  if (ll.status === 'fulfilled') {
    const lista = Array.isArray(ll.value) ? ll.value : [ll.value];
    r.puntos = lista.map((d, i) => ({ nombre: CUENCA[i].nombre, ...ventanas(d.hourly) }));
    for (const k of ['ll6', 'll24', 'prox6', 'prox24']) r[k] = Math.max(...r.puntos.map(p => p[k]));
    r.vivo = r.lluviaVivo = true;
  }
  if (fl.status === 'fulfilled' && fl.value.daily) {
    const q = fl.value.daily.river_discharge.filter(x => x != null);
    r.caudal = q[1] ?? q[0]; r.caudalPico = Math.max(...q.slice(1)); r.vivo = r.caudalVivo = true;
  }
  r.fuente = r.vivo ? 'Open-Meteo + GloFAS, en vivo' : RESPALDO.fuente;
  r.mm24 = r.ll24; // compatibilidad con confianza()
  return r;
}
