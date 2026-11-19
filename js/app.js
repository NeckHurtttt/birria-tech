import { BARRIOS, PERSONAS, minutosHasta, alturaEn, formatoTiempo, confianza, nivelDeRegla, VELOCIDAD_KMH, indiceRiesgo, LAG_CUENCA_MIN } from './datos.js';
import { Oido } from './oido.js';
import { crearMapa } from './mapa.js';
import { Pared } from './pared.js';
import { escanear } from './lluvia.js';
import { temaDemo, abrirCanal } from './canal.js';

const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const JURADO = params.has('jurado');
const ACELERA = Number(params.get('x')) || (JURADO ? 300 : 60); // minutos simulados por minuto real
const tema = temaDemo();

const est = { fase: 'espera', intensidad: 1, simMin: 0, lag: 0, lluvia: null, escenario: null, vecinos: { crecido: 0, desborde: 0 }, personas: {}, regla: null };
PERSONAS.forEach(p => est.personas[p.id] = 'tranquilo');

// ---------- mapa ----------
const mapa = crearMapa($('#mapa'));

// ---------- lista de barrios ----------
const lista = $('#lista-barrios');
BARRIOS.forEach(b => {
  const li = document.createElement('li'); li.id = 'b-' + b.id; li.dataset.e = 'tranquilo';
  li.innerHTML = `<span class="nombre">${b.nombre}</span><span class="tiempo">—</span><span class="info">${b.km} km río abajo de La Angostura</span><span class="barra-t"><i></i></span>`;
  li.onclick = () => { mapa.volar(b); $('#pared-sel').value = b.id; };
  lista.append(li);
});

// ---------- personas ----------
const listaP = $('#lista-personas');
function pintarPersonas() {
  listaP.innerHTML = '';
  PERSONAS.forEach(p => {
    const b = BARRIOS.find(x => x.id === p.barrio), e = est.personas[p.id];
    const txt = { tranquilo: 'sin alerta', avisado: 'avisado', salvo: 'a salvo', rescate: 'al rescate' }[e];
    const li = document.createElement('li'); li.dataset.e = e;
    li.innerHTML = `<span class="av">${p.nombre.replace(/^(Doña|Don|Niños)\s/, '')[0]}</span>
      <div><div class="quien">${p.nombre} · ${b.nombre}, ${p.cuadra}</div><div class="que">${p.necesidad} · guardián: ${p.guardian}</div></div>
      <span class="est">${txt}</span>`;
    if (e === 'avisado') {
      const ok = document.createElement('button'); ok.className = 'btn chico ok'; ok.textContent = 'Confirmar desde aquí';
      ok.onclick = () => confirmar(p.id, 'central'); li.append(ok);
    }
    listaP.append(li);
  });
}
pintarPersonas();

// ---------- canal con guardianes ----------
const canal = abrirCanal(tema, m => { if (m.tipo === 'ok' && m.id) confirmar(m.id, 'celular'); });
function urlGuardian(id) { const u = new URL('guardian.html', location.href); u.search = `?t=${tema}&p=${id}`; return u.href; }
function avisarGuardianes() {
  PERSONAS.forEach(p => {
    const b = BARRIOS.find(x => x.id === p.barrio), min = minutosHasta(b, est.intensidad, est.lag) - est.simMin;
    est.personas[p.id] = 'avisado';
    canal.enviar({ tipo: 'alerta', id: p.id, min: Math.round(min) }, {
      titulo: `Crecida del Piraí: ayuda a ${p.nombre}`,
      texto: `${p.nombre}, ${b.nombre} ${p.cuadra} (${p.necesidad}). El agua llega en ${formatoTiempo(Math.round(min))}. Llévala al punto seguro.`,
      prioridad: 5,
      acciones: [
        { action: 'http', label: 'Ya la ayudé', url: 'https://ntfy.sh/', method: 'POST', body: JSON.stringify({ topic: tema, title: `${p.nombre}: a salvo`, message: `Confirmado por ${p.guardian}`, tags: ['rs', 'tipo=ok', `id=${p.id}`] }), clear: true },
        { action: 'view', label: 'Abrir', url: urlGuardian(p.id) },
      ],
    });
  });
  pintarPersonas();
}
function confirmar(id, desde) {
  if (est.personas[id] === 'salvo') return;
  est.personas[id] = 'salvo'; pintarPersonas();
  const p = PERSONAS.find(x => x.id === id);
  hablar(`${p.nombre} está a salvo.`);
  if (desde === 'central') canal.enviar({ tipo: 'ok', id }, { titulo: `${p.nombre}: a salvo`, texto: 'Confirmado desde la central' });
  if (PERSONAS.every(x => est.personas[x.id] === 'salvo')) setTimeout(exito, 900);
}

// ---------- oído ----------
const estadoOido = $('#estado-oido'), barra = $('#medidor-barra'), detalle = $('#detalle-oido');
const oido = new Oido($('#espectro'), {
  onNivel({ estado, ratio, avance }) {
    if (est.fase === 'alerta') estado = 'crecida';
    estadoOido.dataset.e = estado; estadoOido.textContent = estado;
    barra.style.width = (estado === 'calibrando' ? avance * 30 : Math.min(100, Math.log10(Math.max(1, ratio)) / Math.log10(30) * 100)) + '%';
    if (estado === 'calibrando') detalle.textContent = 'Aprendiendo cómo suena el río normal…';
    else if (estado === 'normal') detalle.textContent = 'Río normal. Escuchando el rugido grave (20–300 Hz).';
    else if (estado === 'subiendo') detalle.textContent = `Rugido ${ratio.toFixed(1)}× más fuerte que lo normal: piedras en movimiento…`;
  },
  onDetecta({ intensidad }) { alerta(intensidad, 'el oído del río'); },
});

const enVoz = t => formatoTiempo(t).replace('h', 'horas').replace('min', 'minutos');
/** lag: minutos hasta que la crecida llega a La Angostura (0 si ya se vio en el río). */
function alerta(intensidad, fuente, lag = 0) {
  if (est.fase === 'alerta') return;
  est.fase = 'alerta'; est.intensidad = Math.max(2, intensidad); est.lag = lag; est.simMin = 0; est.ultimo = performance.now();
  if (!lag) mapa.sensor('crecida');
  const torno = BARRIOS.find(b => b.id === 'eltorno'), min = minutosHasta(torno, est.intensidad, lag);
  $('#detalle-riesgo').textContent = `Alerta por ${fuente}. Intensidad ${est.intensidad.toFixed(1)} de 4.` + (lag ? ` La crecida llegaría a La Angostura en ${formatoTiempo(lag)}.` : '');
  mostrarConfianza();
  hablar(lag
    ? `Atención. Lluvia fuerte en la cuenca alta del Piraí. La crecida llegaría a La Angostura en ${enVoz(lag)} y a El Torno en ${enVoz(min)}.`
    : `Atención. El río suena. Crecida detectada en La Angostura. El agua llegaría a El Torno en ${enVoz(min)}.`);
  avisarGuardianes();
  $('#chip-reloj').hidden = false;
  setTimeout(() => mapa.tramo(torno), 1500);
}
function mostrarConfianza() {
  const c = $('#confianza'); const ll = est.escenario || est.lluvia; if (!ll) return;
  let r = confianza(ll.mm24, est.intensidad);
  if (est.escenario) r = { ...r, texto: `${r.texto} (escenario del simulacro; lluvia real hoy: ${est.lluvia ? est.lluvia.mm24.toFixed(0) : '?'} mm)` };
  if (est.regla != null) r = { nivel: 'alta', texto: `${r.texto} · Regla pintada: ${est.regla.toFixed(2).replace('.', ',')} m (foto de vecino)` };
  c.hidden = est.fase !== 'alerta' && est.regla == null; c.dataset.n = r.nivel; c.textContent = r.texto;
}

// ---------- reloj del simulacro ----------
setInterval(() => {
  if (est.fase !== 'alerta') return;
  const ahora = performance.now(); est.simMin += (ahora - est.ultimo) / 60000 * ACELERA; est.ultimo = ahora;
  const v = VELOCIDAD_KMH * Math.min(1.6, Math.max(0.8, Math.sqrt(est.intensidad)));
  const enRio = est.simMin - est.lag;
  if (enRio >= 0) mapa.sensor('crecida');
  mapa.crecida(Math.max(0, enRio) / 60 * v);
  $('#chip-reloj').className = 'chip reloj';
  $('#chip-reloj').textContent = `×${ACELERA} · +${formatoTiempo(Math.floor(est.simMin)).replace('ya llegó', '0 min')}`;
  BARRIOS.forEach(b => {
    const total = minutosHasta(b, est.intensidad, est.lag), resta = Math.round(total - est.simMin);
    const li = $('#b-' + b.id), llego = resta <= 0;
    li.dataset.e = llego ? 'llego' : 'alerta';
    li.querySelector('.tiempo').textContent = llego ? `${alturaEn(b, est.intensidad).toFixed(1).replace('.', ',')} m` : formatoTiempo(resta);
    li.querySelector('.barra-t i').style.width = Math.min(100, est.simMin / total * 100) + '%';
    li.querySelector('.info').textContent = llego ? 'El agua llegó' : `${b.km} km · hasta ${alturaEn(b, est.intensidad).toFixed(1).replace('.', ',')} m de agua`;
    mapa.barrio(b.id, llego ? `agua ${alturaEn(b, est.intensidad).toFixed(1).replace('.', ',')} m` : formatoTiempo(resta), llego ? 'llego' : 'alerta');
    // sin confirmación 30 min antes de que llegue el agua → rescate oficial
    PERSONAS.filter(p => p.barrio === b.id && est.personas[p.id] === 'avisado' && resta < 30).forEach(p => { est.personas[p.id] = 'rescate'; pintarPersonas(); });
  });
}, 250);

// ---------- botones ----------
// Simulacro: la tormenta de una noche de riada crece en la cuenca alta en ~7 s y el índice cruza el umbral.
const TORMENTA = { ll6: 46, ll24: 64, prox6: 30, prox24: 45, caudalPico: 30 };
let rampa;
$('#btn-simulacro').onclick = () => {
  reiniciar(); oido.simular();
  const base = est.lluvia || { ll6: 0, ll24: 0, prox6: 0, prox24: 0, caudalPico: 7.5 }, t0 = performance.now();
  clearInterval(rampa);
  rampa = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / 7000), e = k * k * (3 - 2 * k);
    est.escenario = { fuente: 'escenario del simulacro' };
    for (const c in TORMENTA) est.escenario[c] = (base[c] || 0) + (TORMENTA[c] - (base[c] || 0)) * e;
    est.escenario.mm24 = est.escenario.ll24;
    if (k > 0.4 && !est.vecinos.crecido) { est.vecinos.crecido = 1; $('#v-vecinos').dataset.extra = '1 reporte · Bermejo: «baja turbio»'; }
    evaluar();
    if (k >= 1) clearInterval(rampa);
  }, 150);
  $('#btn-simulacro').lastChild.textContent = 'Reiniciar simulacro';
};
$('#btn-mic').onclick = async () => {
  reiniciar();
  try { await oido.microfono(); } catch { detalle.textContent = 'No se pudo usar el micrófono. Usa «Iniciar simulacro».'; }
};
function reiniciar() {
  clearInterval(rampa);
  est.fase = 'espera'; est.simMin = 0; est.lag = 0; est.regla = null; est.escenario = null; est.vecinos = { crecido: 0, desborde: 0 };
  delete $('#v-vecinos').dataset.extra; evaluar();
  PERSONAS.forEach(p => est.personas[p.id] = 'tranquilo'); pintarPersonas();
  BARRIOS.forEach(b => { const li = $('#b-' + b.id); li.dataset.e = 'tranquilo'; li.querySelector('.tiempo').textContent = '—'; li.querySelector('.barra-t i').style.width = 0; li.querySelector('.info').textContent = `${b.km} km río abajo de La Angostura`; mapa.barrio(b.id, 'a salvo', ''); });
  mapa.crecida(0); mapa.sensor(''); mapa.general();
  $('#confianza').hidden = true; $('#chip-reloj').hidden = true; $('#exito').hidden = true;
}

// pared
const pared = new Pared($('#video'), $('#lienzo-pared'), $('#pared-msg'));
const sel = $('#pared-sel');
BARRIOS.forEach(b => sel.add(new Option(b.nombre, b.id)));
sel.value = 'eltorno';
const alturaPared = () => { const b = BARRIOS.find(x => x.id === sel.value); $('#pared-barrio').textContent = b.nombre; pared.ponerAltura(alturaEn(b, est.fase === 'alerta' ? est.intensidad : 3)); };
sel.onchange = alturaPared;
$('#btn-pared').onclick = async () => { $('#dlg-pared').showModal(); await pared.camara(); alturaPared(); if (pared.sinCamara) pared.calibrarSolo(); };
$('#pared-auto').onclick = () => pared.calibrarSolo();
$('#pared-cerrar').onclick = () => { pared.apagar(); $('#dlg-pared').close(); };

// QR del guardián
$('#btn-qr').onclick = () => {
  const url = urlGuardian('rosa'), q = $('#qr'); q.innerHTML = '';
  try { new QRCode(q, { text: url, width: 220, height: 220, colorDark: '#071219', colorLight: '#ffffff' }); } catch { q.textContent = 'QR no disponible'; }
  $('#qr-link').textContent = url; $('#qr-tema').textContent = tema;
  $('#dlg-qr').showModal();
};
$('#qr-cerrar').onclick = () => $('#dlg-qr').close();

// regla pintada: tocar 0 m, tope (3 m) y la línea del agua
const REGLA_M = 3;
const cvR = $('#lienzo-regla'), gR = cvR.getContext('2d'); let img, toques = [];
$('#btn-regla').onclick = () => $('#foto-regla').click();
$('#foto-regla').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  img = new Image(); img.onload = () => { cvR.width = img.width; cvR.height = img.height; toques = []; dibujarRegla(); $('#dlg-regla').showModal(); };
  img.src = URL.createObjectURL(f); e.target.value = '';
};
const pasos = ['Toca la marca de 0 m', `Toca la marca de ${REGLA_M} m`, 'Toca la línea del agua'];
function dibujarRegla() {
  gR.drawImage(img, 0, 0);
  toques.forEach((y, i) => { gR.fillStyle = ['#5be7f0', '#ffffff', '#ff5a4a'][i]; gR.fillRect(0, y - 3, cvR.width, 6); });
  $('#regla-paso').textContent = pasos[toques.length] || '';
}
cvR.onpointerdown = e => {
  const r = cvR.getBoundingClientRect(), y = (e.clientY - r.top) * (cvR.height / r.height);
  toques.push(y); if (toques.length > 3) toques = [y]; dibujarRegla();
  if (toques.length === 3) {
    const n = nivelDeRegla(toques[0], toques[1], REGLA_M, toques[2]);
    if (n == null) { $('#regla-paso').textContent = 'La marca de 3 m tiene que estar arriba del 0. Prueba de nuevo.'; toques = []; return; }
    est.regla = n; $('#regla-paso').textContent = `Nivel leído: ${n.toFixed(2).replace('.', ',')} m. Reporte enviado.`;
    mostrarConfianza(); $('#confianza').hidden = false;
    if (n >= 1) { est.vecinos.desborde++; evaluar(); }
    if (n >= 1.5 && est.fase !== 'alerta') alerta(1 + n, 'la foto de la regla');
  }
};
$('#regla-cerrar').onclick = () => $('#dlg-regla').close();

// éxito
function exito() {
  const b = new Set(PERSONAS.map(p => BARRIOS.find(x => x.id === p.barrio).nombre));
  $('#exito-texto').textContent = `${PERSONAS.length} personas que no podían salir solas ya están en el punto seguro (${[...b].join(', ')}), antes de que llegue el agua.`;
  $('#exito').hidden = false; hablar('Todos a salvo.'); oido.detener();
}
$('#exito-cerrar').onclick = () => { $('#exito').hidden = true; mapa.general(); };

// voz
function hablar(t) {
  try { const u = new SpeechSynthesisUtterance(t); u.lang = 'es-419'; u.rate = 1.02; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch {}
}

// ---------- vigía: escaneo de datos abiertos + reportes ----------
const fmt = x => x.toFixed(x < 10 ? 1 : 0).replace('.', ',');
function evaluar() {
  const d = est.escenario || est.lluvia; if (!d) return;
  const idx = indiceRiesgo({ ll6: d.ll6, ll24: d.ll24, prox6: d.prox6, caudal: d.caudalPico, ...est.vecinos });
  const e = est.fase === 'alerta' ? 'alerta' : idx.estado;
  $('#riesgo-num').textContent = Math.round(idx.r * 100);
  const ag = $('.aguja'); ag.style.setProperty('--p', Math.round(idx.r * 100)); ag.dataset.e = e;
  $('#estado-riesgo').dataset.e = e; $('#estado-riesgo').textContent = e;
  $('#p-lluvia').style.width = idx.partes.lluvia * 100 + '%';
  $('#p-rio').style.width = idx.partes.rio * 100 + '%';
  $('#p-vecinos').style.width = idx.partes.vecinos * 100 + '%';
  $('#v-lluvia').textContent = `${fmt(d.ll6)} mm 6 h · ${fmt(d.prox6)} próx.`;
  $('#v-rio').textContent = `${fmt(d.caudalPico)} m³/s (p95 17)`;
  const nv = est.vecinos.crecido + est.vecinos.desborde;
  $('#v-vecinos').textContent = $('#v-vecinos').dataset.extra || `${nv} reporte${nv === 1 ? '' : 's'}`;
  $('#fuente-escaneo').textContent = d === est.escenario ? 'Simulacro: tormenta en la cuenca alta (datos reales de hoy como punto de partida)' : `Datos abiertos de la cuenca alta · ${d.fuente} · sin hardware`;
  if (idx.estado === 'alerta' && est.fase !== 'alerta') alerta(idx.intensidad, 'datos abiertos de la cuenca alta', LAG_CUENCA_MIN);
  if (est.fase !== 'alerta') $('#detalle-riesgo').textContent = idx.estado === 'vigilancia'
    ? 'Vigilancia: el riesgo sube. Pedimos a los vecinos de la ribera foto de la regla.'
    : 'La lluvia en Samaipata y Bermejo tarda unas 2 h 30 min en bajar hasta La Angostura: ese es el tiempo que ganamos.';
}
async function escaneo() {
  const l = await escanear(); est.lluvia = l;
  $('#chip-lluvia span').textContent = `Cuenca alta: ${l.ll24.toFixed(0)} mm (24 h) · ${l.prox24.toFixed(0)} mm próx.`;
  $('#chip-lluvia').title = `Fuente: ${l.fuente}` + (l.puntos.length ? ' · ' + l.puntos.map(p => `${p.nombre} ${p.ll24.toFixed(0)} mm`).join(', ') : '');
  evaluar(); mostrarConfianza();
}
escaneo(); setInterval(escaneo, 10 * 60 * 1000);
$('#btn-crecio').onclick = () => { est.vecinos.crecido++; delete $('#v-vecinos').dataset.extra; evaluar(); };

if (JURADO) { $('#btn-simulacro').classList.add('late'); document.title = 'El Río Suena · demo'; }
window.__rs = { est, alerta, confirmar, oido, mapa, evaluar }; // para pruebas
