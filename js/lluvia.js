import { SENSOR } from './datos.js';
const RESPALDO = { mm24: 38, prox24: 22, fuente: 'respaldo (sin internet)' };

/** Lluvia real de las últimas 24 h y próximas 24 h río arriba (Open-Meteo). */
export async function lluviaRioArriba() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${SENSOR.lat}&longitude=${SENSOR.lon}&hourly=precipitation&past_days=1&forecast_days=2&timezone=America%2FLa_Paz`;
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 5000);
    const r = await fetch(url, { signal: ctl.signal }); clearTimeout(t);
    const d = await r.json();
    const ahora = Date.now();
    let mm24 = 0, prox24 = 0;
    d.hourly.time.forEach((s, i) => {
      const dt = (new Date(s + ':00-04:00').getTime() - ahora) / 3.6e6;
      const p = d.hourly.precipitation[i] || 0;
      if (dt > -24 && dt <= 0) mm24 += p; else if (dt > 0 && dt <= 24) prox24 += p;
    });
    return { mm24, prox24, fuente: 'Open-Meteo, en vivo' };
  } catch { return { ...RESPALDO }; }
}
