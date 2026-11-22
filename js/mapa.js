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

  // punto rojo del caso cuyo chat está abierto, ANCLADO a una coordenada real cerca del barrio: es un marcador más del
  // mapa (sin desplazamiento en pantalla), así se mueve y hace zoom con él. La coordenada se elige una vez al abrir el chat
  // (y otra cuando el mapa termina de acercarse al barrio): se prueban lugares alrededor del barrio, en círculos, y queda
  // el primero que no cae sobre ninguna etiqueta visible ni detrás de un panel o del chat. Arranca en un ángulo que depende
  // del caso, para que dos casos del mismo barrio no caigan en el mismo lugar.
  let pulso = null, turnoPulso = 0, alLlegar = null;
  const quitarCaso = () => { turnoPulso++; if (alLlegar) map.off('moveend', alLlegar); alLlegar = null; pulso?.remove(); pulso = null; };
  const obstaculos = () => [
    ...[...el.querySelectorAll('.maplibregl-marker')].filter(m => !m.classList.contains('caso-pulso') && m.style.visibility !== 'hidden'),
    ...document.querySelectorAll('.panel, .flotante, #chat:not([hidden])'),
  ].map(m => m.getBoundingClientRect()).filter(r => r.width && r.height);
  const anclarPulso = (b, clave) => {
    if (!pulso) return;
    const caja = el.getBoundingClientRect(), c = map.project([b.lon, b.lat]), obs = obstaculos(), r = 16;
    const libre = (x, y) => x > r && x < caja.width - r && y > r && y < caja.height - r
      && !obs.some(q => caja.left + x - r < q.right && caja.left + x + r > q.left && caja.top + y - r < q.bottom && caja.top + y + r > q.top);
    let h = 0; for (const ch of String(clave)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const ang0 = (h % 16) * Math.PI / 8;
    for (const radio of [30, 42, 56, 72, 92]) for (let k = 0; k < 16; k++) {
      const a = ang0 + k * Math.PI / 8, x = c.x + Math.cos(a) * radio, y = c.y + Math.sin(a) * radio;
      if (libre(x, y)) { pulso.setLngLat(map.unproject([x, y])); return; }
    }
    pulso.setLngLat(map.unproject([c.x + 30, c.y + 30])); // sin lugar libre a la vista: queda pegado al barrio
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
      quitarCaso(); const turno = turnoPulso;
      const d = document.createElement('div'); d.className = 'caso-pulso'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = '<i></i>';
      pulso = new maplibregl.Marker({ element: d }).setLngLat([b.lon, b.lat]).addTo(map);
      anclarPulso(b, clave);
      // si el barrio quedó detrás de los paneles o del chat, el mapa se acerca (sin cambiar el zoom) y al terminar se vuelve a
      // elegir la coordenada, ya con el barrio a la vista
      const caja = el.getBoundingClientRect(), pt = map.project([b.lon, b.lat]), pad = { ...PAD() };
      const chat = document.querySelector('#chat:not([hidden])')?.getBoundingClientRect();
      if (chat && innerWidth > 900) pad.right = Math.max(pad.right, caja.right - chat.left + 20);
      const hayLugar = caja.width - pad.left - pad.right > 80;
      if (hayLugar && (pt.x < pad.left + 30 || pt.x > caja.width - pad.right - 30 || pt.y < pad.top + 30 || pt.y > caja.height - pad.bottom - 30)) {
        // solo el final de ESTE movimiento vuelve a elegir la coordenada: si después la persona hace zoom o mueve el mapa,
        // el punto se queda en su lugar (anclado)
        alLlegar = e => { if (e.casoPulso !== turno) return; map.off('moveend', alLlegar); alLlegar = null; if (turno === turnoPulso) anclarPulso(b, clave); };
        map.on('moveend', alLlegar);
        map.easeTo({ center: [b.lon, b.lat], duration: 1200, padding: pad }, { casoPulso: turno });
      }
    },
    quitarCaso,
    /** coordenada [lon, lat] donde quedó anclado el punto del caso (para pruebas) */
    get casoLngLat() { return pulso ? pulso.getLngLat().toArray() : null; },
  };
}
function vacio() { return { type: 'FeatureCollection', features: [] }; }
