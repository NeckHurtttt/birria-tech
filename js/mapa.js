import { CAUCE, BARRIOS, SENSOR, tramoHasta } from './datos.js';
const PAD = () => innerWidth > 900 ? { left: 400, right: 360, top: 40, bottom: 40 } : { left: 20, right: 20, top: 20, bottom: 20 };
const ESTILO = 'https://tiles.openfreemap.org/styles/dark';
const ESTILO_RESPALDO = { version: 8, sources: {}, layers: [{ id: 'fondo', type: 'background', paint: { 'background-color': '#08131c' } }] };

export function crearMapa(el) {
  const map = new maplibregl.Map({ container: el, style: ESTILO, center: [-63.36, -17.93], zoom: 9.2, pitch: 55, bearing: -20, attributionControl: { compact: true } });
  map.setPadding(PAD());
  let respaldo = false;
  const t = setTimeout(() => { if (!map.isStyleLoaded()) { respaldo = true; map.setStyle(ESTILO_RESPALDO); } }, 6000);
  map.on('error', e => { if (!respaldo && /style|tiles/i.test(e?.error?.message || '')) { respaldo = true; clearTimeout(t); map.setStyle(ESTILO_RESPALDO); } });
  const capas = () => {
    if (map.getSource('cauce')) return;
    map.addSource('cauce', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: CAUCE } } });
    map.addLayer({ id: 'cauce-brillo', type: 'line', source: 'cauce', paint: { 'line-color': '#2fd3e0', 'line-width': 14, 'line-blur': 10, 'line-opacity': 0.35 } });
    map.addLayer({ id: 'cauce', type: 'line', source: 'cauce', paint: { 'line-color': '#5be7f0', 'line-width': 3 } });
    map.addSource('crecida', { type: 'geojson', data: vacio() });
    map.addLayer({ id: 'crecida', type: 'line', source: 'crecida', paint: { 'line-color': '#ff5a4a', 'line-width': 9, 'line-blur': 2, 'line-opacity': 0.9 } });
  };
  map.on('style.load', capas);
  map.on('load', () => {
    clearTimeout(t);
    if (innerWidth <= 900) el.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
  });

  const marcas = {};
  const marca = (id, lon, lat, html, clase) => {
    const d = document.createElement('div'); d.className = 'marca ' + clase; d.innerHTML = html;
    marcas[id] = { el: d, m: new maplibregl.Marker({ element: d }).setLngLat([lon, lat]).addTo(map) };
  };
  marca('sensor', SENSOR.lon, SENSOR.lat, '<span class="pulso"></span><b>La Angostura</b>', 'sensor');
  BARRIOS.forEach(b => marca(b.id, b.lon, b.lat, `<b>${b.nombre}</b><span class="cr" id="cr-${b.id}">a salvo</span>`, 'barrio'));

  return {
    map,
    /** dibuja la crecida hasta km recorridos desde el sensor */
    crecida(km) {
      const s = map.getSource('crecida'); if (!s) return;
      const pts = km > 0 ? tramoHasta(km) : [];
      s.setData(pts.length > 1 ? { type: 'Feature', geometry: { type: 'LineString', coordinates: pts } } : vacio());
    },
    sensor(clase) { marcas.sensor.el.classList.toggle('crecida', clase === 'crecida'); },
    barrio(id, texto, estado) {
      const m = marcas[id]; if (!m) return;
      m.el.querySelector('.cr').textContent = texto; m.el.dataset.estado = estado;
    },
    volar(b) { map.flyTo({ center: [b.lon, b.lat], zoom: 11, pitch: 58, duration: 2500, padding: PAD() }); },
    tramo(b) { map.fitBounds([[Math.min(SENSOR.lon, b.lon), Math.min(SENSOR.lat, b.lat)], [Math.max(SENSOR.lon, b.lon), Math.max(SENSOR.lat, b.lat)]], { padding: { top: 60, bottom: 120, left: 80, right: 60 }, pitch: 50, duration: 2500 }); },
    general() { map.flyTo({ center: [-63.36, -17.93], zoom: 9.2, pitch: 55, bearing: -20, duration: 2000, padding: PAD() }); },
  };
}
function vacio() { return { type: 'FeatureCollection', features: [] }; }
