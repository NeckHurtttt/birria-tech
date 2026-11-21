import { BARRIOS, minutosHasta, alturaEn, formatoTiempo, confianza, nivelDeRegla, VELOCIDAD_KMH, indiceRiesgo, LAG_CUENCA_MIN } from './datos.js';
import { Oido } from './oido.js';
import { crearMapa } from './mapa.js';
import { Pared } from './pared.js';
import { escanear } from './lluvia.js';
import { temaDemo, abrirCanal } from './canal.js';
import { activas, todas, registrar, aprobar, quitar, aCSV, sincronizar, subirPendientes } from './registro.js';
import { hayNube, claveJunta, comunidad } from './nube.js';
import { RIADA_2025 } from './historico.js';
import { repetirRiada, LAG_VIGIA_MIN, CAUDAL_HIST } from './datos.js';

const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const JURADO = params.has('jurado');
const ACELERA = Number(params.get('x')) || (JURADO ? 300 : 60); // minutos simulados por minuto real
const tema = temaDemo();

const est = { fase: 'espera', intensidad: 1, simMin: 0, lag: 0, lluvia: null, escenario: null, vecinos: { crecido: 0, desborde: 0, vigias: 0 }, personas: {}, margen: {}, regla: null, avisoT: 0, resp: {} };
// temporizadores de un simulacro: se cancelan todos al reiniciar (evita pantallas fantasma)
const timers = new Set();
const despues = (f, ms) => { const id = setTimeout(() => { timers.delete(id); f(); }, ms); timers.add(id); return id; };
const cancelarTimers = () => { timers.forEach(clearTimeout); timers.clear(); };
activas().forEach(p => est.personas[p.id] = 'tranquilo');

// ---------- mapa ----------
const mapa = crearMapa($('#mapa'));

// ---------- lista de barrios ----------
const lista = $('#lista-barrios');
BARRIOS.forEach(b => {
  const li = document.createElement('li'); li.id = 'b-' + b.id; li.dataset.e = 'tranquilo';
  li.innerHTML = `<span class="nombre">${b.nombre}</span><span class="tiempo">sin crecida</span><span class="info">${b.km} km río abajo de La Angostura</span><span class="barra-t"><i></i></span>`;
  li.onclick = () => { mapa.volar(b); $('#pared-sel').value = b.id; };
  lista.append(li);
});

// ---------- personas ----------
const listaP = $('#lista-personas');
function pintarPersonas() {
  listaP.innerHTML = '';
  activas().forEach(p => {
    const b = BARRIOS.find(x => x.id === p.barrio), e = est.personas[p.id] || (est.personas[p.id] = 'tranquilo');
    const txt = { tranquilo: 'sin alerta', avisado: 'avisado', salvo: 'a salvo', rescate: 'al rescate' }[e];
    const li = document.createElement('li'); li.dataset.e = e;
    li.innerHTML = `<span class="av">${esc((p.nombre.replace(/^(Doña|Don|Niños)\s/, '')[0] || '?'))}</span>
      <div><div class="quien">${esc(p.nombre)} · ${b.nombre}, ${esc(p.cuadra)}</div><div class="que">${esc(p.necesidad)} · guardián: ${esc(p.guardian)}</div></div>
      <span class="est">${txt}${e === 'salvo' && est.resp[p.id] ? ` · ${reloj(est.resp[p.id].seg)}` : ''}</span>`;
    if (e === 'avisado' || e === 'rescate') {
      const ok = document.createElement('button'); ok.className = 'btn chico ok';
      ok.textContent = e === 'rescate' ? 'Rescate oficial confirmó' : 'Confirmar desde aquí';
      ok.onclick = () => confirmar(p.id, 'central');
      const acc = document.createElement('div'); acc.className = 'acciones'; acc.append(ok);
      // respaldo sin internet: SMS y llamada al guardián (sin número abre la app de SMS para elegir el contacto)
      const min = Math.max(0, Math.round(minutosHasta(b, est.intensidad, est.lag) - est.simMin));
      const sms = document.createElement('a'); sms.className = 'btn chico'; sms.textContent = 'SMS';
      sms.href = `sms:${p.tel || ''}?&body=${encodeURIComponent(`EL RÍO SUENA: crecida del Piraí. Ayuda a ${p.nombre} (${b.nombre}, ${p.cuadra}). El agua llega en ${formatoTiempo(min)}. Responde OK cuando esté a salvo.`)}`;
      acc.append(sms);
      if (p.tel) { const tel = document.createElement('a'); tel.className = 'btn chico'; tel.textContent = 'Llamar'; tel.href = 'tel:' + p.tel; acc.append(tel); }
      li.append(acc);
    }
    listaP.append(li);
  });
}
pintarPersonas();

// ---------- respuestas en vivo (tiempo REAL, no simulado) ----------
const reloj = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
function respuestaEnVivo(id) {
  const p = activas().find(x => x.id === id), r = est.resp[id], cel = r.desde === 'celular';
  const t = document.createElement('div'); t.className = 'respuesta' + (cel ? ' cel' : '');
  t.innerHTML = `<b>${esc(p.nombre)}: a salvo</b><span>${cel ? `${esc(p.guardian)} confirmó desde su celular` : 'confirmado en la central'} · ${reloj(r.seg)} tras el aviso</span>`;
  $('#respuestas').append(t); setTimeout(() => t.remove(), 9000);
}

// ---------- canal con guardianes ----------
const canal = abrirCanal(tema, m => {
  if (m.tipo === 'ok' && m.id) confirmar(m.id, 'celular');
  if (m.tipo === 'reg') traerJunta();
});
const PUBLICA = 'https://neckhurtttt.github.io/el-rio-suena/';
function urlGuardian(id) { const u = new URL('guardian.html', /^(localhost|127\.|192\.168\.)/.test(location.hostname) || location.protocol === 'file:' ? PUBLICA : location.href); const s = new URLSearchParams({ t: tema, p: id }), per = todas().find(x => x.id === id);
  if (per && !per.demo) { s.set('n', per.nombre); s.set('b', per.barrio); s.set('cu', per.cuadra); s.set('nec', per.necesidad); s.set('g', per.guardian); }
  u.search = '?' + s; return u.href; }
function avisarGuardianes() {
  est.avisoT = Date.now(); est.resp = {};
  activas().forEach(p => {
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
  // solo se confirma a quien fue avisado: ignora toques viejos o de otro simulacro
  if (est.fase !== 'alerta' || !['avisado', 'rescate'].includes(est.personas[id])) return;
  est.personas[id] = 'salvo';
  est.resp[id] = { seg: Math.round((Date.now() - est.avisoT) / 1000), desde };
  pintarPersonas(); respuestaEnVivo(id);
  { const pb = activas().find(x => x.id === id), bb = BARRIOS.find(x => x.id === pb.barrio); est.margen[id] = Math.round(minutosHasta(bb, est.intensidad, est.lag) - est.simMin); }
  const p = activas().find(x => x.id === id);
  hablar(`${p.nombre} está a salvo.`);
  if (desde === 'central') canal.enviar({ tipo: 'ok', id }, { titulo: `${p.nombre}: a salvo`, texto: 'Confirmado desde la central' });
  if (activas().every(x => est.personas[x.id] === 'salvo')) despues(exito, 900);
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
  despues(() => mapa.tramo(torno), 1500);
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
  let cambio = false;
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
    activas().filter(p => p.barrio === b.id && est.personas[p.id] === 'avisado' && resta < 30).forEach(p => { est.personas[p.id] = 'rescate'; cambio = true; });
  });
  if (cambio) pintarPersonas();
}, 250);

// ---------- botones ----------
// Simulacro: la tormenta de una noche de riada crece en la cuenca alta en ~7 s y el índice cruza el umbral.
const TORMENTA = { ll6: 46, ll24: 64, prox6: 30, prox24: 45, caudalPico: 58 };
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
  $('#btn-simulacro').classList.remove('late');
};
$('#btn-mic').onclick = async () => {
  reiniciar();
  est.escenario = null;
  try { await oido.microfono(); }
  catch { estadoOido.dataset.e = 'apagado'; estadoOido.textContent = 'apagado'; detalle.textContent = 'No se pudo usar el micrófono (permiso negado o sin HTTPS). Usa «Iniciar simulacro».'; }
};
function reiniciar() {
  est.margen = {};
  clearInterval(rampa); cancelarTimers(); oido.detener();
  try { speechSynthesis.cancel(); } catch {}
  est.fase = 'espera'; est.simMin = 0; est.lag = 0; est.intensidad = 1; est.regla = null; est.escenario = null; est.vecinos = { crecido: 0, desborde: 0, vigias: 0 };
  delete $('#v-vecinos').dataset.extra; evaluar();
  activas().forEach(p => est.personas[p.id] = 'tranquilo'); pintarPersonas();
  BARRIOS.forEach(b => { const li = $('#b-' + b.id); li.dataset.e = 'tranquilo'; li.querySelector('.tiempo').textContent = 'sin crecida'; li.querySelector('.barra-t i').style.width = 0; li.querySelector('.info').textContent = `${b.km} km río abajo de La Angostura`; mapa.barrio(b.id, 'sin alerta', 'tranquilo'); });
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
$('#btn-pared').onclick = async () => {
  const dlg = $('#dlg-pared'); if (dlg.open) return;
  dlg.showModal(); alturaPared();
  await pared.camara();
  if (!dlg.open) return; // se cerró mientras esperaba el permiso
  alturaPared(); if (pared.sinCamara) pared.calibrarSolo();
};
$('#pared-auto').onclick = () => pared.calibrarSolo();
$('#pared-cerrar').onclick = () => $('#dlg-pared').close();
$('#dlg-pared').addEventListener('close', () => pared.apagar()); // también con Esc o el botón atrás

// QR del guardián
$('#btn-qr-jurado').onclick = () => $('#btn-qr').click();
$('#btn-qr').onclick = () => abrirQR('rosa');
function abrirQR(id) {
  if ($('#dlg-qr').open) return;
  const per = todas().find(x => x.id === id);
  $('#dlg-qr h3').textContent = `Sé guardián de ${per?.nombre || 'Doña Rosa'}`;
  const url = urlGuardian(id), q = $('#qr'); q.innerHTML = '';
  try { new QRCode(q, { text: url, width: 300, height: 300, colorDark: '#071219', colorLight: '#ffffff' }); } catch { q.textContent = 'QR no disponible'; }
  $('#qr-link').textContent = url; $('#qr-tema').textContent = tema;
  $('#dlg-qr').showModal();
}
$('#qr-cerrar').onclick = () => $('#dlg-qr').close();

// regla pintada: tocar 0 m, tope (3 m) y la línea del agua
const REGLA_M = 3;
const cvR = $('#lienzo-regla'), gR = cvR.getContext('2d'); let img, toques = [];
$('#btn-regla').onclick = () => $('#foto-regla').click();
$('#foto-regla').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const url = URL.createObjectURL(f), foto = new Image();
  foto.onload = () => {
    URL.revokeObjectURL(url);
    // una foto de 12 MP ocupa ~48 MB en un canvas: se reduce a 1600 px como máximo
    const k = Math.min(1, 1600 / Math.max(foto.width, foto.height));
    img = document.createElement('canvas'); img.width = Math.round(foto.width * k); img.height = Math.round(foto.height * k);
    img.getContext('2d').drawImage(foto, 0, 0, img.width, img.height);
    cvR.width = img.width; cvR.height = img.height; toques = []; dibujarRegla();
    if (!$('#dlg-regla').open) $('#dlg-regla').showModal();
  };
  foto.onerror = () => { URL.revokeObjectURL(url); detalle.textContent = 'No se pudo leer esa imagen.'; };
  foto.src = url; e.target.value = '';
};
const pasos = ['Toca la marca de 0 m', `Toca la marca de ${REGLA_M} m`, 'Toca la línea del agua'];
function dibujarRegla() {
  if (!img) return;
  gR.drawImage(img, 0, 0);
  toques.forEach((y, i) => { gR.fillStyle = ['#5be7f0', '#ffffff', '#ff5a4a'][i]; gR.fillRect(0, y - 3, cvR.width, 6); });
  $('#regla-paso').textContent = pasos[toques.length] || '';
}
cvR.onpointerdown = e => {
  if (!img) return;
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
  const b = new Set(activas().map(p => BARRIOS.find(x => x.id === p.barrio).nombre));
  $('#exito-texto').textContent = `${activas().length} personas que no podían salir solas ya están en el punto seguro (${[...b].join(', ')}), antes de que llegue el agua.`;
  const m = Object.values(est.margen), prom = m.length ? Math.round(m.reduce((a, x) => a + x, 0) / m.length) : 0;
  $('#exito-datos').innerHTML = `<div><b>${activas().length}</b><span>personas confirmadas</span></div><div><b>${formatoTiempo(prom).replace('ya llegó', '0 min')}</b><span>de margen promedio antes del agua</span></div><div><b>0 Bs</b><span>para las familias</span></div>`;
  $('#exito').hidden = false; hablar('Todos a salvo.'); oido.detener();
  est.fase = 'fin'; $('#exito-cerrar').focus();
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
  $('#p-vecinos').style.width = Math.max(idx.partes.vecinos, idx.partes.arriba) * 100 + '%';
  $('#v-lluvia').textContent = `${fmt(d.ll6)} mm 6 h · ${fmt(d.prox6)} próx.`;
  $('#v-rio').textContent = `${fmt(d.caudalPico)} m³/s (p95 ${CAUDAL_HIST.p95})`;
  const nv = est.vecinos.crecido + est.vecinos.desborde + est.vecinos.vigias;
  $('#v-vecinos').textContent = $('#v-vecinos').dataset.extra || `${nv} reporte${nv === 1 ? '' : 's'}`;
  $('#fuente-escaneo').textContent = d === est.escenario ? 'Simulacro: tormenta en la cuenca alta (datos reales de hoy como punto de partida)' : `Datos abiertos de la cuenca alta · ${d.fuente} · sin hardware`;
  if (idx.estado === 'alerta' && est.fase !== 'alerta') {
    if (idx.fuente === 'vigias') alerta(idx.intensidad, 'dos vigías río arriba', LAG_VIGIA_MIN);
    else alerta(idx.intensidad, 'datos abiertos de la cuenca alta', LAG_CUENCA_MIN);
  }
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
$('#btn-vigia').onclick = () => { est.vecinos.vigias++; $('#v-vecinos').dataset.extra = `${est.vecinos.vigias} vigía${est.vecinos.vigias > 1 ? 's' : ''} río arriba: «el río creció»`; evaluar(); };

// ---------- registro de personas y panel de la junta ----------
const nombreBarrio = id => (BARRIOS.find(b => b.id === id) || {}).nombre || id;
BARRIOS.forEach(b => $('#reg-barrio').add(new Option(b.nombre, b.id)));
$('#btn-registro').onclick = () => { $('#form-registro').reset(); $('#reg-msg').textContent = ''; $('#dlg-registro').showModal(); $('#reg-nombre').focus(); };
$('#reg-cerrar').onclick = () => $('#dlg-registro').close();
$('#form-registro').onsubmit = e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  const { subida } = registrar(d), msg = $('#reg-msg');
  msg.textContent = `${d.nombre} quedó guardado en este celular. Enviando a la junta…`;
  subida.then(ok => {
    msg.textContent = ok ? `✓ ${d.nombre} llegó al registro de la junta vecinal. Cuando lo aprueben, su guardián recibe las alertas.`
      : `${d.nombre} quedó guardado en este celular; se envía a la junta apenas haya internet.`;
    if (ok) canal.enviar({ tipo: 'reg' }); // la central actualiza su panel al instante
  });
  e.target.reset(); pintarJunta();
};
addEventListener('online', () => subirPendientes());
subirPendientes();

// la junta ve la lista compartida solo con su clave (se guarda mientras dure la pestaña)
let ultimaSinc = 0, sincronizando = false;
async function traerJunta(clave = claveJunta.leer(), avisar = false) {
  if (!hayNube() || !clave || sincronizando) return;
  sincronizando = true;
  try {
    const n = await sincronizar(clave); claveJunta.poner(clave); ultimaSinc = Date.now();
    todas().forEach(p => { if (p.aprobado && !est.personas[p.id]) est.personas[p.id] = 'tranquilo'; });
    estadoNube(`Registro compartido · comunidad «${comunidad}» · ${n} registradas · al día`, 'ok');
    pintarPersonas(); pintarJunta();
  } catch (err) {
    if (/clave/i.test(err.message)) { claveJunta.poner(''); estadoNube('Clave de la junta incorrecta.', 'mal'); }
    else estadoNube(`Sin conexión con el registro compartido (${err.message}). Se muestra la última copia.`, 'mal');
    if (avisar) $('#junta-clave').focus();
  } finally { sincronizando = false; }
}
function estadoNube(t, e) { const n = $('#junta-nube'); if (n) { n.textContent = t; n.dataset.e = e || ''; } }
$('#junta-entrar').onclick = () => traerJunta($('#junta-clave').value.trim(), true);
$('#junta-clave').onkeydown = e => { if (e.key === 'Enter') $('#junta-entrar').click(); };
function pintarJunta() {
  const tb = $('#junta-filas'); if (!tb) return; tb.innerHTML = '';
  const l = todas(), estados = { ...est.personas };
  const n = { total: l.length, pend: l.filter(p => !p.aprobado).length, salvo: l.filter(p => estados[p.id] === 'salvo').length, falta: l.filter(p => ['avisado', 'rescate'].includes(estados[p.id])).length };
  $('#junta-resumen').textContent = `${n.total} personas · ${n.pend} pendientes de aprobar · ${n.salvo} a salvo · ${n.falta} sin confirmar`;
  l.forEach(p => {
    const tr = document.createElement('tr'), e = p.aprobado ? (estados[p.id] || 'tranquilo') : 'pendiente';
    tr.dataset.e = e;
    tr.innerHTML = `<td>${esc(p.nombre)}${p.demo ? ' <small>(demo)</small>' : ''}</td><td>${esc(nombreBarrio(p.barrio))}, ${esc(p.cuadra)}</td><td>${esc(p.necesidad)}</td><td>${esc(p.guardian)}${p.tel ? `<br><small>${esc(p.tel)}</small>` : ''}</td><td><span class="est">${{ tranquilo: 'sin alerta', avisado: 'avisado', salvo: 'a salvo', rescate: 'al rescate', pendiente: 'pendiente' }[e]}</span></td><td class="acc"></td>`;
    const acc = tr.querySelector('.acc');
    if (!p.aprobado) { const b = document.createElement('button'); b.className = 'btn chico ok'; b.textContent = 'Aprobar'; b.onclick = () => accionJunta(b, () => aprobar(p.id, claveJunta.leer()), () => { est.personas[p.id] = 'tranquilo'; }); acc.append(b); }
    if (p.aprobado && !p.demo) { const b = document.createElement('button'); b.className = 'btn chico'; b.textContent = 'QR guardián'; b.onclick = () => { $('#dlg-junta').close(); abrirQR(p.id); }; acc.append(b); }
    if (!p.demo) { const b = document.createElement('button'); b.className = 'btn chico'; b.textContent = 'Quitar'; b.onclick = () => accionJunta(b, () => quitar(p.id, claveJunta.leer()), () => { delete est.personas[p.id]; }); acc.append(b); }
    tb.append(tr);
  });
}
async function accionJunta(btn, hacer, luego) {
  btn.disabled = true;
  try { await hacer(); luego(); } catch (err) { estadoNube(`No se pudo: ${err.message}`, 'mal'); }
  pintarPersonas(); pintarJunta();
}
function esc(t) { return String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
$('#btn-junta').onclick = () => {
  pintarJunta(); $('#dlg-junta').showModal();
  const con = !!claveJunta.leer();
  $('#junta-login').hidden = !hayNube() || con;
  if (!hayNube()) estadoNube('Registro solo en este celular (sin registro compartido configurado).');
  else if (con) traerJunta(); else { estadoNube(`Comunidad «${comunidad}»: escribe la clave de la junta para ver el registro compartido.`); $('#junta-clave').focus(); }
};
$('#junta-cerrar').onclick = () => $('#dlg-junta').close();
$('#junta-imprimir').onclick = () => window.print();
$('#junta-csv').onclick = () => {
  const blob = new Blob([aCSV(todas(), est.personas, nombreBarrio)], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `el-rio-suena-junta-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
setInterval(() => { if ($('#dlg-junta').open) pintarJunta(); }, 1000);
// respaldo por si se pierde el aviso de ntfy: refresca cada 30 s si la junta ya entró
setInterval(() => { if (claveJunta.leer() && Date.now() - ultimaSinc > 30000) traerJunta(); }, 5000);
if (claveJunta.leer()) traerJunta();

// ---------- riada real del 13/12/2025 ----------
const riada = repetirRiada(RIADA_2025);
$('#btn-riada').onclick = () => { $('#dlg-riada').showModal(); animarRiada(); };
$('#riada-cerrar').onclick = () => $('#dlg-riada').close();
$('#riada-fuentes').innerHTML = RIADA_2025.fuentes.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`).join(' · ');
let animR;
function animarRiada() {
  const svg = $('#riada-svg'), F = riada.filas, W = 600, H = 220, pad = 30, bw = (W - pad * 2) / F.length;
  const maxMM = 15, y = v => H - pad - v * (H - pad * 2);
  const hh = f => f.hora.slice(11, 13) + ':00';
  let html = `<line class="eje" x1="${pad}" y1="${y(0)}" x2="${W - pad}" y2="${y(0)}"/><line class="umbral" x1="${pad}" y1="${y(0.55)}" x2="${W - pad}" y2="${y(0.55)}"/><text class="et" x="${pad + 4}" y="${y(0.55) - 6}">umbral de alerta (55)</text>`;
  F.forEach((f, i) => {
    const x = pad + i * bw;
    html += `<rect class="mm" data-i="${i}" x="${x + 1}" width="${bw - 2}" y="${y(Math.min(1, f.mm / maxMM))}" height="${y(0) - y(Math.min(1, f.mm / maxMM))}"/>`;
    if (i % 3 === 0) html += `<text class="et" x="${x + bw / 2}" y="${H - 10}" text-anchor="middle">${hh(f)}</text>`;
  });
  const linea = k => F.map((f, i) => `${i ? 'H' + (pad + i * bw) + 'V' + y(f[k]) : 'M' + pad + ',' + y(f[k])}`).join('') + `H${pad + F.length * bw}`;
  html += `<path class="l-solo" d="${linea('solo')}"/><path class="l-con" d="${linea('con')}"/>`;
  const xm = i => pad + i * bw + bw / 2;
  html += `<line class="m-vigia" x1="${xm(riada.iVigia)}" x2="${xm(riada.iVigia)}" y1="${pad - 6}" y2="${y(0)}"/><text class="et vig" x="${xm(riada.iVigia) - 4}" y="${pad - 10}" text-anchor="end">2 vigías: «creció»</text>`;
  html += `<line class="m-desb" x1="${xm(riada.iDesborde)}" x2="${xm(riada.iDesborde)}" y1="${pad - 6}" y2="${y(0)}"/><text class="et des" x="${xm(riada.iDesborde) + 4}" y="${pad - 10}">desborde</text>`;
  html += `<rect class="cortina" x="${pad}" y="0" width="${W - pad}" height="${H}"/>`;
  svg.innerHTML = html;
  const cort = svg.querySelector('.cortina'), t0 = performance.now(), dur = 6000;
  $('#riada-veredicto').hidden = true;
  cancelAnimationFrame(animR);
  const paso = () => {
    const k = Math.min(1, (performance.now() - t0) / dur);
    cort.setAttribute('x', pad + k * (W - pad * 2)); cort.setAttribute('width', Math.max(0, (W - pad) - k * (W - pad * 2)));
    if (k < 1) animR = requestAnimationFrame(paso); else { cort.remove(); $('#riada-veredicto').hidden = false; }
  };
  animR = requestAnimationFrame(paso);
}
$('#riada-veredicto').innerHTML = `
  <div class="v mal"><b>Solo modelos abiertos</b><span>Vieron ${fmt(riada.lluviaTotal)} mm en 24 h (máx. 3 mm/h). Riesgo máximo ${Math.round(riada.maxSolo * 100)}/100: <strong>no habría alertado</strong>. La tormenta del Amboró fue demasiado local para los modelos globales.</span></div>
  <div class="v bien"><b>Con vigías río arriba</b><span>Dos vecinos de Bermejo o del río Espejos reportan «el río creció» → alerta a las ${riada.alertaCon.slice(11, 16)}: <strong>${formatoTiempo(riada.ventajaMin)} antes</strong> del desborde en El Torno.</span></div>
  <p class="nota">Lluvia: Open-Meteo Historical Forecast (best_match), 5 puntos de la cuenca alta. Caudal: GloFAS, que tampoco subió (${Object.values(RIADA_2025.caudalDia).map(x => fmt(x)).join(' → ')} m³/s). La hora del reporte de los vigías es hipotética: sale del tiempo que tarda la crecida en bajar (modelo de la app, caso rápido).</p>`;

// ---------- accesibilidad ----------
const A11Y = 'rs-grande';
const ponerGrande = on => { document.documentElement.classList.toggle('grande', on); $('#btn-grande').setAttribute('aria-pressed', on); try { localStorage.setItem(A11Y, on ? '1' : ''); } catch {} };
try { if (localStorage.getItem(A11Y)) ponerGrande(true); } catch {}
$('#btn-grande').onclick = () => ponerGrande(!document.documentElement.classList.contains('grande'));
$('#btn-repetir').onclick = () => hablar($('#detalle-riesgo').textContent + ' ' + [...document.querySelectorAll('#lista-barrios li')].map(li => li.querySelector('.nombre').textContent + ': ' + li.querySelector('.tiempo').textContent.replace('h', 'horas').replace('min', 'minutos')).join('. '));

// ---------- funciona sin internet (PWA) ----------
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
addEventListener('offline', () => document.body.classList.add('sin-red'));
addEventListener('online', () => document.body.classList.remove('sin-red'));

if (JURADO) { $('#btn-simulacro').classList.add('late'); document.title = 'El Río Suena · demo'; }
window.__rs = { est, alerta, confirmar, oido, mapa, evaluar, activas, riada }; // para pruebas
