// Aviso oficial de SENAMHI (boletín hidrológico de Santa Cruz, cuenca del Piraí).
// datos/senamhi.json lo genera herramientas/senamhi.py (GitHub Action cada día hábil).
// El Río Suena no contradice al aviso oficial: la amenaza de SENAMHI pone un piso al índice.
export const URL_SENAMHI = 'https://neckhurtttt.github.io/birria-tech/datos/senamhi.json';
export const ORDEN = { sin: 0, amarilla: 1, naranja: 2, roja: 3 };
export const NOMBRE = { sin: 'sin amenaza', amarilla: 'amarilla', naranja: 'naranja', roja: 'roja' };
const VIGENCIA_DIAS = 5; // un boletín más viejo que esto ya no se usa

const isoLocal = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Amenaza oficial de hoy: el peor tramo (alta, media, baja). null si no hay boletín vigente. */
export function amenazaHoy(s, ahora = new Date()) {
  if (!s || !s.tramos || !s.boletin) return null;
  const hoy = isoLocal(ahora);
  if ((Date.parse(hoy) - Date.parse(s.boletin)) / 864e5 > VIGENCIA_DIAS) return null;
  let peor = null;
  for (const [tramo, dias] of Object.entries(s.tramos)) {
    const d = (dias || []).find(x => x.fecha === hoy);
    if (d && d.amenaza && (!peor || ORDEN[d.amenaza] > ORDEN[peor.nivel])) peor = { nivel: d.amenaza, tendencia: d.tendencia, tramo };
  }
  if (!peor) return null;
  // próximo día con amenaza mayor a la de hoy (para "sube a naranja el lunes")
  const futuro = Object.values(s.tramos).flat().filter(x => x.fecha > hoy && ORDEN[x.amenaza] > ORDEN[peor.nivel]).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  return { ...peor, boletin: s.boletin, estacion: s.estacion, url: s.url, sube: futuro ? { fecha: futuro.fecha, nivel: futuro.amenaza } : null };
}

/** Texto corto para la app y los avisos. */
export function textoOficial(a) {
  if (!a) return '';
  const dia = f => new Date(f + 'T12:00').toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric' });
  let t = `SENAMHI hoy: amenaza ${NOMBRE[a.nivel]}` + (a.tendencia ? ` · ${a.tendencia}` : '');
  if (a.sube) t += ` · sube a ${NOMBRE[a.sube.nivel]} el ${dia(a.sube.fecha)}`;
  if (a.estacion?.nivel_m != null) t += ` · ${a.estacion.nombre} ${String(a.estacion.nivel_m).replace('.', ',')} m`;
  return t;
}

/** Descarga el boletín ya procesado. Nunca lanza error: sin datos devuelve null. */
export async function cargarSenamhi(url = URL_SENAMHI, ms = 8000) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(ms), cache: 'no-cache' });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}
