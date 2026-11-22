import { CAUCE, BARRIOS, SENSOR, tramoHasta } from './datos.js';
const PAD_CENTRAL = () => innerWidth > 900 ? { left: 400, right: 360, top: 40, bottom: 40 } : { left: 20, right: 20, top: 20, bottom: 20 };
const ESTILO = 'https://tiles.openfreemap.org/styles/dark';
const ESTILO_RESPALDO = { version: 8, sources: {}, layers: [{ id: 'fondo', type: 'background', paint: { 'background-color': '#08131c' } }] };

export function crearMapa(el, opc = {}) {
  // en un mapa chico (guardián/vecino) el padding de los paneles de la central no aplica
  const PAD = opc.pad ? () => opc.pad : PAD_CENTRAL;
  const map = new maplibregl.Map({ container: el, style: ESTILO, center: [-63.36, -17.93], zoom: 9.2, pitch: 55, bearing: -20, attributionControl: { compact: true }, ...(opc.mapa || {}) });
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
  const marca = (id, lon, lat, html, clase, anchor = 'center') => {
    const d = document.createElement('div'); d.className = 'marca ' + clase; d.innerHTML = html;
    marcas[id] = { el: d, m: new maplibregl.Marker({ element: d, anchor, offset: [0, anchor === 'bottom' ? -6 : anchor === 'top' ? 6 : 0] }).setLngLat([lon, lat]).addTo(map) };
  };
  marca('sensor', SENSOR.lon, SENSOR.lat, '<span class="pulso"></span><b>La Angostura</b>', 'sensor');
  // barrios vecinos en el cauce: uno arriba y otro abajo del punto para que no se tapen
  BARRIOS.forEach((b, i) => marca(b.id, b.lon, b.lat, `<b>${b.nombre}</b><span class="cr" id="cr-${b.id}">sin alerta</span>`, 'barrio', i % 2 ? 'top' : 'bottom'));
  Object.values(marcas).forEach(({ el: d }) => { if (d.classList.contains('barrio')) d.dataset.estado = 'tranquilo'; });
  // un marcador cortado contra el borde del mapa se ve como un error: se oculta mientras esté ahí
  // y si dos etiquetas se pisan (celular, zoom lejano) queda la más importante:
  // tu barrio > La Angostura > barrio con alerta > barrio > punto de lluvia
  const prioridad = d => d.classList.contains('mio') ? 5 : d.classList.contains('sensor') ? 4
    : d.dataset.estado && d.dataset.estado !== 'tranquilo' ? 3 : d.classList.contains('barrio') ? 2 : 1;
  const recortar = () => {
    const w = el.clientWidth, h = el.clientHeight;
    Object.values(marcas).forEach(({ el: d, m }) => {
      const { x, y } = map.project(m.getLngLat());
      d.style.visibility = x < 40 || x > w - 40 || y < 36 || y > h - 20 ? 'hidden' : '';
    });
    // el punto del caso abierto no compite con las etiquetas: siempre se ve (está corrido para no taparlas)
    const todas = [...el.querySelectorAll('.maplibregl-marker')].filter(d => !d.classList.contains('caso-pulso') && (d.style.visibility !== 'hidden' || d.dataset.tapada));
    todas.forEach(d => { if (d.dataset.tapada) { d.style.visibility = ''; delete d.dataset.tapada; } });
    const puestas = [];
    todas.sort((a, b) => prioridad(b) - prioridad(a)).forEach(d => {
      const r = d.getBoundingClientRect(), m = 2;
      if (puestas.some(q => r.left < q.right + m && r.right > q.left - m && r.top < q.bottom + m && r.bottom > q.top - m)) { d.style.visibility = 'hidden'; d.dataset.tapada = '1'; }
      else puestas.push(r);
    });
  };
  map.on('move', recortar); map.on('resize', recortar); map.on('idle', recortar);

  // punto rojo pulsante del caso cuyo chat está abierto: alrededor del barrio, nunca encima de su etiqueta. La etiqueta
  // del barrio queda arriba del punto (índice par) o abajo (impar): el punto va al lado contrario, y a un costado que
  // depende del caso, así dos casos del mismo barrio caen en lugares distintos.
  let pulso = null, vigilarPulso = 0;
  const quitarCaso = () => { clearInterval(vigilarPulso); pulso?.remove(); pulso = null; };
  // corre el punto hasta un lugar libre: no puede caer sobre NINGUNA etiqueta visible (barrios, La Angostura), porque a
  // ciertos zooms la etiqueta de un barrio vecino queda justo al lado. Prueba primero el lugar preferido y luego
  // alrededor, en círculos cada vez más amplios. Si el lugar actual sigue libre, no lo mueve (sin saltos).
  const ubicarPulso = () => {
    if (!pulso) return;
    const d = pulso.getElement(), caja = el.getBoundingClientRect(), p = map.project(pulso.getLngLat());
    const etiquetas = [...el.querySelectorAll('.maplibregl-marker')].filter(m => m !== d && m.style.visibility !== 'hidden').map(m => m.getBoundingClientRect());
    const libre = ([dx, dy]) => {
      const x = caja.left + p.x + dx, y = caja.top + p.y + dy, r = 13;
      return !etiquetas.some(q => x - r < q.right && x + r > q.left && y - r < q.bottom && y + r > q.top);
    };
    const actual = pulso.getOffset(); if (libre([actual.x, actual.y])) return;
    const pref = pulso._pref, ang0 = Math.atan2(pref[1], pref[0]);
    for (const radio of [28, 40, 54, 70, 90]) for (let k = 0; k < 12; k++) {
      const a = ang0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 6), o = [Math.round(Math.cos(a) * radio), Math.round(Math.sin(a) * radio)];
      if (libre(o)) { pulso.setOffset(o); return; }
    }
  };

  return {
    map,
    /** dibuja la crecida hasta km recorridos desde el sensor */
    crecida(km) {
      const s = map.getSource('crecida'); if (!s) return;
      const pts = km > 0 ? tramoHasta(km) : [];
      s.setData(pts.length > 1 ? { type: 'Feature', geometry: { type: 'LineString', coordinates: pts } } : vacio());
    },
    /** el barrio de quien mira el mapa nunca se oculta */
    destacar(id) { Object.entries(marcas).forEach(([k, { el: d }]) => d.classList.toggle('mio', k === id)); recortar(); },
    sensor(clase) { marcas.sensor.el.classList.toggle('crecida', clase === 'crecida'); },
    barrio(id, texto, estado) {
      const m = marcas[id]; if (!m) return;
      m.el.querySelector('.cr').textContent = texto; m.el.dataset.estado = estado; recortar();
    },
    volar(b) { map.flyTo({ center: [b.lon, b.lat], zoom: 11, pitch: 58, duration: 2500, padding: PAD() }); },
    // MapLibre suma este padding al de los paneles (setPadding), por eso aquí va solo el margen extra
    tramo(b) { const m = innerWidth > 900 ? { top: 60, bottom: 120, left: 80, right: 60 } : { top: 30, bottom: 30, left: 20, right: 20 }; map.fitBounds([[Math.min(SENSOR.lon, b.lon), Math.min(SENSOR.lat, b.lat)], [Math.max(SENSOR.lon, b.lon), Math.max(SENSOR.lat, b.lat)]], { padding: m, pitch: 50, duration: 2500 }); },
    general() { map.flyTo({ center: [-63.36, -17.93], zoom: 9.2, pitch: 55, bearing: -20, duration: 2000, padding: PAD() }); },
    caso(b, clave = '') {
      quitarCaso();
      const i = BARRIOS.findIndex(x => x.id === b.id), etiquetaArriba = i % 2 === 0;
      let h = 0; for (const c of String(clave)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const dx = (h % 2 ? 1 : -1) * (24 + (h % 13)), dy = (etiquetaArriba ? 1 : -1) * (22 + ((h >> 4) % 10));
      const d = document.createElement('div'); d.className = 'caso-pulso'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = '<i></i>';
      pulso = new maplibregl.Marker({ element: d, offset: [dx, dy] }).setLngLat([b.lon, b.lat]).addTo(map);
      pulso._pref = [dx, dy];
      // si el barrio quedó detrás de los paneles (o fuera del mapa), se lo acerca sin cambiar el zoom; al terminar, 'idle'
      // vuelve a revisar que el punto no tape ninguna etiqueta
      const pt = map.project([b.lon, b.lat]), pad = PAD(), w = el.clientWidth, hh = el.clientHeight;
      if (pt.x < pad.left + 30 || pt.x > w - pad.right - 30 || pt.y < pad.top + 30 || pt.y > hh - pad.bottom - 30)
        map.easeTo({ center: [b.lon, b.lat], duration: 1200, padding: PAD() });
      // las etiquetas aparecen y se ocultan solas (al mover el mapa o avanzar la crecida) y durante el simulacro el mapa casi
      // nunca queda «idle»: mientras el chat está abierto se revisa seguido (si el lugar sigue libre, no se mueve)
      requestAnimationFrame(ubicarPulso); vigilarPulso = setInterval(ubicarPulso, 400);
    },
    quitarCaso,
    /** vuelve a buscar un lugar libre para el punto del caso (sin tapar etiquetas) */
    reubicarCaso: () => ubicarPulso(),
    /** dónde está el punto del caso: desplazamiento actual y preferido (para pruebas) */
    get casoOffset() { return pulso ? { actual: pulso.getOffset(), pref: pulso._pref } : null; },
  };
}
function vacio() { return { type: 'FeatureCollection', features: [] }; }
