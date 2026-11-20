import { CAUCE, BARRIOS, SENSOR, tramoHasta } from './datos.js';
const PAD = () => innerWidth > 900 ? { left: 400, right: 360, top: 40, bottom: 40 } : { left: 20, right: 20, top: 20, bottom: 20 };
const ESTILO = 'https://tiles.openfreemap.org/styles/dark';
const ESTILO_RESPALDO = { version: 8, sources: {}, layers: [{ id: 'fondo', type: 'background', paint: { 'background-color': '#08131c' } }] };

export function crearMapa(el) {
  const map = new maplibregl.Map({ container: el, style: ESTILO, center: [-63.36, -17.93], zoom: 9.2, pitch: 55, bearing: -20, attributionControl: { compact: true } });
  map.setPadding(PAD());
  // al girar el celular o cambiar el tamaño de ventana, el padding de los paneles cambia
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => map.setPadding(PAD()), 200); });
  let respaldo = false;
  const t = setTimeout(() => { if (!map.isStyleLoaded()) { respaldo = true; map.setStyle(ESTILO_RESPALDO); } }, 6000);
  // sin internet, cada tesela fallida lanza un error: solo se cambia de estilo una vez y se silencia el resto
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
  marca('sensor', SENSOR.lon, SENSOR.lat, '<span class="pulso"></span><b>Oído del río</b>', 'sensor');
  BARRIOS.forEach(b => marca(b.id, b.lon, b.lat, `<b>${b.nombre}</b><span class="cr" id="cr-${b.id}">a salvo</span>`, 'barrio'));
  // un marcador cortado contra el borde del mapa se ve como un error: se oculta mientras esté ahí
  const recortar = () => {
    const w = el.clientWidth, h = el.clientHeight;
    Object.values(marcas).forEach(({ el: d, m }) => {
      const { x, y } = map.project(m.getLngLat());
      d.style.visibility = x < 40 || x > w - 40 || y < 36 || y > h - 20 ? 'hidden' : '';
    });
  };
  map.on('move', recortar); map.on('resize', recortar); map.once('idle', recortar);

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
    // MapLibre suma este padding al de los paneles (setPadding), por eso aquí va solo el margen extra
    tramo(b) { const m = innerWidth > 900 ? { top: 60, bottom: 120, left: 80, right: 60 } : { top: 30, bottom: 30, left: 20, right: 20 }; map.fitBounds([[Math.min(SENSOR.lon, b.lon), Math.min(SENSOR.lat, b.lat)], [Math.max(SENSOR.lon, b.lon), Math.max(SENSOR.lat, b.lat)]], { padding: m, pitch: 50, duration: 2500 }); },
    general() { map.flyTo({ center: [-63.36, -17.93], zoom: 9.2, pitch: 55, bearing: -20, duration: 2000, padding: PAD() }); },
  };
}
function vacio() { return { type: 'FeatureCollection', features: [] }; }
