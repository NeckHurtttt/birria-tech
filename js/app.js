import { BARRIOS, minutosHasta, alturaEn, formatoTiempo, confianza, nivelDeRegla, VELOCIDAD_KMH, indiceRiesgo, LAG_CUENCA_MIN } from './datos.js';
import { Oido } from './oido.js';
import { crearMapa } from './mapa.js';
import { Pared } from './pared.js';
import { escanear } from './lluvia.js';
import { temaDemo, abrirCanal } from './canal.js';
import { activas, todas, registrar, aprobar, quitar, aCSV, sincronizar, subirPendientes } from './registro.js';
import { hayNube, claveJunta, comunidad, vigiaCentral, deLectura } from './nube.js';
import { RIADA_2025 } from './historico.js';
import { repetirRiada, LAG_VIGIA_MIN, CAUDAL_HIST } from './datos.js';
import { cargarSenamhi, amenazaHoy, textoOficial } from './senamhi.js';
import { iniciarIdioma, idiomaActual, vozActual, t as traducir } from './idioma.js';
import { mensajesNuevos } from './mensajes.js';
import { PERSONAS, NOMBRES_FIJOS, nombresAleatorios, ayudantesAleatorios, NOMBRE_SORTEADO, AYUDANTE_SORTEADO, NOMBRES_AYUDANTES } from './datos.js';
import { elegirSugerencias, temaDe, respuestaConfirmacion } from './chat-textos.js';

// Nombres de las personas de ejemplo y de sus ayudantes: se sortean al abrir la central (no hay uno fijo). Se guardan
// en esta pestaña para que al recargar o reiniciar el simulacro sigan siendo los mismos que ya viajaron en el QR al
// celular del ayudante. Otra pestaña (o cerrar y abrir) sortea de nuevo.
{
  // clave nueva: lo guardado con la lista corta de antes se descarta; también un nombre fijo de antes (Doña Rosa…)
  const CLAVE = 'rs-sorteo-demo-v2';
  const valido = s => s && PERSONAS.every(p => typeof s.nombres?.[p.id] === 'string' && !NOMBRES_FIJOS.includes(s.nombres[p.id]) && NOMBRE_SORTEADO.test(s.nombres[p.id])
    && typeof s.ayudantes?.[p.id] === 'string' && AYUDANTE_SORTEADO.test(s.ayudantes[p.id]));
  let s = null;
  try { s = JSON.parse(sessionStorage.getItem(CLAVE)); } catch {}
  if (!valido(s)) {
    s = { nombres: nombresAleatorios(PERSONAS), ayudantes: ayudantesAleatorios(PERSONAS) };
    try { sessionStorage.setItem(CLAVE, JSON.stringify(s)); } catch {}
  }
  PERSONAS.forEach(p => { p.nombre = s.nombres[p.id]; p.guardian = s.ayudantes[p.id]; });
}

// idioma de la interfaz (ES · EN · 中文): cambia sin recargar; ver js/idioma.js
iniciarIdioma(document.querySelector('#idioma-sel'));

const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const JURADO = params.has('jurado');
const ACELERA = Number(params.get('x')) || (JURADO ? 300 : 60); // minutos simulados por minuto real
const tema = temaDemo();

const est = { fase: 'espera', intensidad: 1, simMin: 0, lag: 0, lluvia: null, escenario: null, vecinos: { crecido: 0, desborde: 0, vigias: 0 }, oficial: null, personas: {}, margen: {}, regla: null, avisoT: 0, resp: {}, recib: {}, vigiasCel: new Set(),
  chat: {}, etapa: {}, chatTimer: {}, pregunta: {}, tema: {}, apuros: {}, apuroTimer: {}, sugeridas: {} }; // chat con cada ayudante: mensajes, paso del ayudante (0 avisado, 1 en camino, 2 a salvo) y su próximo mensaje
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
// etiqueta corta de la necesidad para la tarjeta (el texto completo queda en el title)
const NECESIDAD_CORTA = { 'silla de ruedas': 'Silla de ruedas', 'no oye: aviso en señas': 'No oye · señas', 'solos hasta las 19:00': 'Solos hasta 19:00', 'habla quechua': 'Habla quechua' };
const necesidadCorta = n => NECESIDAD_CORTA[n] || (n ? n[0].toUpperCase() + n.slice(1) : '');
// «Marcelo (vecino)» → «Marcelo»: en la tarjeta ya dice «Ayudante»
const nombreAyudante = g => String(g || '').replace(/\s*\((vecin[oa])\)\s*$/i, '');
// avatar: silueta gris sin rostro (como el perfil por defecto de una red social), la misma de los mensajes de emergencia,
// distinta para mujer (pelo largo hasta los hombros) y hombre (pelo corto, hombros anchos)
const SILUETA = {
  m: '<svg class="silueta" viewBox="0 0 36 36"><path class="pelo" d="M11.6 13.4c-.2-4.6 2.7-7.4 6.4-7.4s6.6 2.8 6.4 7.4c-1.2-1.9-3.4-2.9-6.4-2.9s-5.2 1-6.4 2.9z"/><circle class="piel" cx="18" cy="14.2" r="6.1"/><path class="piel" d="M4 37c0-8 6.2-12.3 14-12.3S32 29 32 37z"/></svg>',
  f: '<svg class="silueta" viewBox="0 0 36 36"><path class="pelo" d="M9.6 15.2c0-6 3.7-9.8 8.4-9.8s8.4 3.8 8.4 9.8c0 4.3.8 8 2.6 11.2-2.8 1.6-6.5 2.3-11 2.3s-8.2-.7-11-2.3c1.8-3.2 2.6-6.9 2.6-11.2z"/><path class="piel" d="M8 37c0-6.6 4.4-10.4 10-10.4s10 3.8 10 10.4z"/><circle class="piel" cx="18" cy="15" r="5.4"/><path class="pelo" d="M12.6 13.6c1.6-3.3 4-4.6 7.2-4.2 1.9.3 3.3 1.4 4.1 3.4-3.6.4-7.4-.1-11.3.8z"/></svg>',
};
// silueta según el nombre que se ve: «Doña …» mujer, «Don …» hombre; si no, la ficha (g); grupos («Niños …», «Familia …») y sin dato: hombre
const generoPersona = p => /^Doña\s/i.test(p.nombre) ? 'f' : /^Don\s/i.test(p.nombre) ? 'm' : (p.g === 'f' ? 'f' : 'm');

// ---------- chat con el ayudante ----------
// En la demo el ayudante contesta solo durante el simulacro (mensajes simulados; en un despliegue real llegarían por el
// mismo canal de avisos). Flujo obligatorio:
//   1. al saltar la alerta, el ayudante avisa que va en camino;
//   2. la central le escribe (respuesta rápida o texto propio);
//   3. recién entonces el ayudante confirma que ya están a salvo, y se habilita «Confirmar evacuación» (en el chat y en la tarjeta).
// Nunca se confirma por temporizador ni sin que la central escriba antes. Si el ayudante confirma desde su celular
// («Ya la ayudé» en la app), eso vale igual porque es una confirmación real.
const VARIANTE = lista => lista[Math.floor(Math.random() * lista.length)];
const PASOS_AYUDANTE = [
  // 1: en camino (sale solo al saltar la alerta)
  [p => `¡Ya voy por ${p.nombre}! El agua ya está cubriendo la calle.`,
    p => `¡Voy corriendo a buscar a ${p.nombre}, el río está bramando!`,
    p => `¡En camino por ${p.nombre}! La corriente ya pasa por la esquina.`,
    p => `¡Ya salgo por ${p.nombre}! El río suena cada vez más fuerte.`],
  // 2: a salvo (solo como respuesta a un mensaje de la central)
  [() => '¡Listo! Ya estamos a salvo en la loma, el agua ya tapó la calle.',
    p => `¡Ya está! Sacamos a ${p.nombre} justo a tiempo, estamos en punto alto.`,
    () => '¡A salvo! Llegamos a la plaza; atrás el río ya se llevó la vereda.',
    p => `¡Lo logramos! ${p.nombre} ya está con nosotros en la escuela, el agua sigue subiendo.`],
];
const CHAT = { abierto: null, sinLeer: new Set(), escribiendo: new Set() };
const horaChat = () => new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false });
// silueta del ayudante: «(vecina)» o un nombre de la lista de mujeres → mujer; si no, hombre
const generoAyudante = g => /\(vecina\)\s*$/i.test(g) || NOMBRES_AYUDANTES.f.includes(nombreAyudante(g).replace(/^Profe\s+/i, '')) ? 'f' : 'm';
const enAlerta = id => est.fase === 'alerta' && est.personas[id] === 'avisado';
const listoParaConfirmar = id => (est.etapa[id] || 0) >= PASOS_AYUDANTE.length;
function decirChat(id, de, texto) {
  (est.chat[id] ||= []).push({ de, texto, hora: horaChat() });
  if (CHAT.abierto === id) pintarChat(); else if (de === 'ayudante') CHAT.sinLeer.add(id);
}
/** El próximo mensaje del ayudante llega en ms (con «escribiendo…» justo antes). Reprogramar reemplaza al anterior. */
function programarPaso(id, ms) {
  clearTimeout(est.chatTimer[id]); CHAT.escribiendo.delete(id);
  est.chatTimer[id] = despues(() => {
    if (!enAlerta(id)) return;
    CHAT.escribiendo.add(id); if (CHAT.abierto === id) pintarChat();
    est.chatTimer[id] = despues(() => pasoAyudante(id), 1200);
  }, Math.max(0, ms - 1200));
}
function pasoAyudante(id) {
  const p = activas().find(x => x.id === id), n = est.etapa[id] || 0;
  clearTimeout(est.chatTimer[id]); delete est.chatTimer[id]; CHAT.escribiendo.delete(id);
  // la confirmación (paso 2) solo sale si la central escribió: nunca por tiempo
  if (!p || !enAlerta(id) || n >= PASOS_AYUDANTE.length || (n === 1 && !est.pregunta[id])) { if (CHAT.abierto === id) pintarChat(); pintarPersonas(); return; }
  est.etapa[id] = n + 1;
  decirChat(id, 'ayudante', n === 0 ? VARIANTE(PASOS_AYUDANTE[0])(p) : respuestaConfirmacion(p, est.tema[id] || 'general'));
  if (n === 0) {
    // ya va en camino: si la central escribió antes de este aviso, la confirmación sigue; si no, espera su mensaje
    if (est.pregunta[id]) programarPaso(id, 3500 + Math.random() * 2000); else programarApuro(id);
  } else {
    est.pregunta[id] = false;
    programarApuro(id); // sin aviso de sistema: el botón verde de abajo ya lo dice
  }
  pintarPersonas();
}
// apuro: si la central tarda en entrar a ese chat (porque atiende otro), el ayudante insiste cada 12–18 s, hasta 3 veces
// por tramo y sin repetir. En camino pide respuesta (sin decir que ya están a salvo); ya a salvo pide que confirmen.
// Si la central está mirando ese chat, o ya le escribió y la respuesta viene en camino, esa vez no insiste.
const APUROS = {
  camino: [
    p => `¡Central, respondan! Ya llegué donde ${p.nombre}, el agua nos llega a los tobillos.`,
    () => '¿Me copian? El río sigue creciendo, necesito que me respondan.',
    p => `¡Sigo con ${p.nombre} y la señal se corta! Escríbanme por favor.`,
    () => '¡Central! Aquí el agua sube rápido, ¿me escuchan?',
  ],
  listo: [
    p => `¡Central, por favor confirmen recibido! Ya estamos en punto alto con ${p.nombre}.`,
    () => '¿Me copian en la central? Ya salimos de la zona baja, espero confirmación.',
    p => `¡Sigo esperando que confirmen la evacuación de ${p.nombre}, la señal está inestable!`,
    () => '¡Por favor respondan! Necesito saber si ya nos registraron como evacuados.',
  ],
};
const MAX_APUROS = 3;
const tramoApuro = id => listoParaConfirmar(id) ? 'listo' : 'camino';
function programarApuro(id) {
  clearTimeout(est.apuroTimer[id]); delete est.apuroTimer[id];
  if ((est.apuros[id]?.[tramoApuro(id)]?.length || 0) >= MAX_APUROS) return;
  est.apuroTimer[id] = despues(() => apurar(id), 12000 + Math.random() * 6000);
}
function apurar(id) {
  delete est.apuroTimer[id];
  const p = activas().find(x => x.id === id);
  if (!p || !enAlerta(id) || !(est.etapa[id] || 0)) return;
  // la central está en este chat, o ya escribió y la respuesta del ayudante viene en camino: no hace falta insistir
  if (CHAT.abierto === id || (!listoParaConfirmar(id) && est.pregunta[id])) { programarApuro(id); return; }
  const tramo = tramoApuro(id), usados = ((est.apuros[id] ||= {})[tramo] ||= []);
  const libres = APUROS[tramo].map((_, i) => i).filter(i => !usados.includes(i));
  const i = libres[Math.floor(Math.random() * libres.length)]; usados.push(i);
  decirChat(id, 'ayudante', APUROS[tramo][i](p));
  pintarPersonas(); programarApuro(id);
}
function pararApuro(id) { clearTimeout(est.apuroTimer[id]); delete est.apuroTimer[id]; }
/** Mensaje de la central: es lo que destraba la confirmación del ayudante. */
function enviarCentral(id, texto, tema) {
  texto = String(texto || '').trim().slice(0, 160); if (!texto) return;
  // se anota antes de pintar el mensaje: así el chat ya muestra «Mensaje enviado…» y oculta las respuestas rápidas
  const espera = enAlerta(id) && !listoParaConfirmar(id), yaPregunto = est.pregunta[id];
  if (espera) {
    est.pregunta[id] = true;
    // de qué trata lo que escribió (o la sugerencia que tocó): la respuesta del ayudante habla de eso; vale el último mensaje
    est.tema[id] = tema || temaDe(texto, activas().find(x => x.id === id));
  }
  decirChat(id, 'central', texto);
  if (!espera) return;
  if (yaPregunto && est.chatTimer[id]) return; // ya hay una respuesta en camino: no la reinicia
  // todavía no avisó que va en camino: ese aviso se adelanta y la confirmación llega después
  programarPaso(id, (est.etapa[id] || 0) ? 2500 + Math.random() * 1500 : 1800);
  pintarPersonas();
}
// sugerencias de la central: 2 de temas distintos, del banco de js/chat-textos.js; quedan fijas mientras el paso del
// ayudante no cambie (así no saltan cada vez que llega un mensaje)
function sugerencias(id, p, n) {
  const paso = n ? 1 : 0, guardadas = est.sugeridas[id];
  if (guardadas?.paso === paso) return guardadas.lista;
  const lista = elegirSugerencias(p, paso);
  est.sugeridas[id] = { paso, lista }; return lista;
}
function reiniciarEstadoChats() {
  est.chat = {}; est.etapa = {}; est.chatTimer = {}; est.pregunta = {}; est.tema = {}; est.apuros = {}; est.apuroTimer = {}; est.sugeridas = {};
  CHAT.sinLeer.clear(); CHAT.escribiendo.clear();
}
function iniciarChats() {
  reiniciarEstadoChats();
  activas().forEach((p, i) => {
    const b = BARRIOS.find(x => x.id === p.barrio), min = Math.max(0, Math.round(minutosHasta(b, est.intensidad, est.lag) - est.simMin));
    decirChat(p.id, 'sistema', `Alerta enviada a ${nombreAyudante(p.guardian)}. El agua llega en ${formatoTiempo(min)}.`);
    programarPaso(p.id, 3000 + i * 1500 + Math.random() * 3000); // aviso «en camino», escalonado: no contestan todos a la vez
  });
}
function limpiarChats() { reiniciarEstadoChats(); cerrarChat(); }
function abrirChat(id) {
  CHAT.abierto = id; CHAT.sinLeer.delete(id);
  $('#chat').hidden = false; pintarChat(); pintarPersonas();
  if (matchMedia('(min-width: 901px)').matches) $('#chat-texto').focus();
}
function cerrarChat() { CHAT.abierto = null; $('#chat').hidden = true; }
function pintarChat() {
  const id = CHAT.abierto, p = activas().find(x => x.id === id);
  if (!p) { cerrarChat(); return; }
  const b = BARRIOS.find(x => x.id === p.barrio), e = est.personas[id], n = est.etapa[id] || 0, ayu = nombreAyudante(p.guardian);
  $('#chat-av').innerHTML = SILUETA[generoAyudante(p.guardian)];
  $('#chat-quien').textContent = ayu;
  $('#chat-persona').textContent = `${p.nombre} · ${b.nombre}, ${p.cuadra}`;
  const [txt, clave] = e === 'salvo' ? ['evacuado', 'salvo'] : e === 'rescate' ? ['al rescate', 'rescate'] : e !== 'avisado' ? ['sin alerta', 'tranquilo']
    : n >= PASOS_AYUDANTE.length ? ['a salvo', 'listo'] : n ? ['en camino', 'camino'] : ['avisado', 'avisado'];
  const ce = $('#chat-est'); ce.textContent = txt; ce.dataset.e = clave;
  // mensajes (con textContent: lo que escribe la central no se interpreta como HTML)
  const ol = $('#chat-msjs'); ol.replaceChildren();
  for (const m of est.chat[id] || []) {
    const li = document.createElement('li'); li.className = m.de;
    if (m.de === 'sistema') li.textContent = m.texto;
    else {
      if (m.de === 'ayudante') { const de = document.createElement('span'); de.className = 'de'; de.textContent = ayu; de.translate = false; li.append(de); }
      const bur = document.createElement('span'); bur.className = 'burbuja'; bur.textContent = m.texto;
      if (m.de === 'central') bur.translate = false; // lo que escribe la central queda tal cual
      const hora = document.createElement('small'); hora.textContent = m.de === 'central' ? `${m.hora} · Central` : m.hora;
      li.append(bur, hora);
    }
    ol.append(li);
  }
  if (CHAT.escribiendo.has(id)) {
    const li = document.createElement('li'); li.className = 'ayudante escribiendo';
    li.innerHTML = `<span class="burbuja" aria-label="escribiendo"><i></i><i></i><i></i></span>`;
    ol.append(li);
  }
  // zona de abajo, sin cuadros extra:
  //  - mientras falta la confirmación del ayudante: sugerencias + campo de escribir (la indicación va en el placeholder)
  //  - en cuanto el ayudante confirma: solo el botón «Confirmar evacuación», grande y verde
  const listo = enAlerta(id) && listoParaConfirmar(id), escribir = enAlerta(id) && !listo;
  const form = $('#chat-form'), input = $('#chat-texto'), zona = $('#chat-confirmar'), ok = $('#chat-ok');
  const teniaFoco = document.activeElement === input;
  form.hidden = !escribir;
  input.placeholder = est.pregunta[id] ? 'Esperando la confirmación del ayudante…' : 'Responde al ayudante para que confirme…';
  zona.hidden = !listo; ok.disabled = !listo;
  if (listo && teniaFoco) ok.focus(); // el campo desaparece: el foco pasa al botón
  // sugerencias variadas: mandan un mensaje de verdad (cuentan como «la central escribió»); nada de atajos que lo salteen
  const rap = $('#chat-rapidas'); rap.replaceChildren();
  if (escribir && !est.pregunta[id]) {
    for (const { texto, tema } of sugerencias(id, p, n)) { const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'btn chico'; bt.textContent = texto; bt.onclick = () => enviarCentral(id, texto, tema); rap.append(bt); }
  }
  // auto-scroll al último mensaje, también después de que la zona de abajo cambie de alto
  ol.scrollTop = ol.scrollHeight; requestAnimationFrame(() => { ol.scrollTop = ol.scrollHeight; });
  // respaldo sin internet: SMS (sin número abre la app de SMS para elegir el contacto) y llamada si hay número
  const min = Math.max(0, Math.round(minutosHasta(b, est.intensidad, est.lag) - est.simMin));
  const resp = $('#chat-respaldo'); resp.replaceChildren();
  if (e === 'avisado' || e === 'rescate') {
    const etq = document.createElement('span'); etq.textContent = 'Sin internet:'; resp.append(etq);
    const sms = document.createElement('a'); sms.textContent = 'SMS';
    sms.href = `sms:${p.tel || ''}?&body=${encodeURIComponent(`EL RÍO SUENA: crecida del Piraí. Ayuda a ${p.nombre} (${b.nombre}, ${p.cuadra}). El agua llega en ${formatoTiempo(min)}. Responde OK cuando esté a salvo.`)}`;
    resp.append(sms);
    if (p.tel) { const tel = document.createElement('a'); tel.textContent = 'Llamar'; tel.href = 'tel:' + p.tel; resp.append(tel); }
  }
}
$('#chat-cerrar').onclick = cerrarChat;
// confirmar desde el chat: queda EVACUADO en la tarjeta y el chat se cierra solo para seguir con los demás casos
$('#chat-ok').onclick = () => { const id = CHAT.abierto; if (id && enAlerta(id) && listoParaConfirmar(id)) { confirmar(id, 'central'); cerrarChat(); } };
$('#chat-form').onsubmit = ev => { ev.preventDefault(); const i = $('#chat-texto'); if (CHAT.abierto) enviarCentral(CHAT.abierto, i.value); i.value = ''; };
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !$('#chat').hidden && !document.querySelector('dialog[open]')) cerrarChat(); });

function pintarPersonas() {
  listaP.innerHTML = '';
  // los ya evacuados bajan al final para que los casos pendientes queden arriba, a mano; el resto conserva su orden
  const ordenadas = activas().map((p, i) => ({ p, i, fin: est.personas[p.id] === 'salvo' })).sort((a, b) => a.fin - b.fin || a.i - b.i).map(x => x.p);
  ordenadas.forEach(p => {
    const b = BARRIOS.find(x => x.id === p.barrio), e = est.personas[p.id] || (est.personas[p.id] = 'tranquilo');
    // 'salvo' = el traslado ya se confirmó (desde la central o el celular del ayudante): en la tarjeta dice «evacuado»
    // mientras está avisado, el estado sigue al chat: «en camino» y luego «a salvo» (listo para confirmar, a la espera de la central)
    const paso = e === 'avisado' ? (est.etapa[p.id] || 0) : 0, listoConfirmar = paso >= PASOS_AYUDANTE.length;
    const txt = paso ? (listoConfirmar ? 'a salvo' : 'en camino') : { tranquilo: 'sin alerta', avisado: 'avisado', salvo: 'evacuado', rescate: 'al rescate' }[e];
    const li = document.createElement('li'); li.dataset.e = e; if (paso) li.dataset.paso = listoConfirmar ? 'listo' : 'camino';
    li.innerHTML = `<span class="av" aria-hidden="true">${SILUETA[generoPersona(p)]}</span>
      <div class="quien"><b>${esc(p.nombre)}</b><span class="donde">${b.nombre}, ${esc(p.cuadra)}</span></div>
      <div class="que"><span class="tag" title="${esc(p.necesidad)}">${esc(necesidadCorta(p.necesidad))}</span><span class="ayu"><span>Ayudante</span><b>${esc(nombreAyudante(p.guardian))}</b></span></div>
      <span class="est">${txt}${e === 'salvo' && est.resp[p.id] ? ` · ${reloj(est.resp[p.id].seg)}` : ''}${e === 'avisado' && !paso && est.recib[p.id] != null ? ` · recibió ${reloj(est.recib[p.id])}` : ''}</span>`;
    // aviso discreto: mensaje nuevo del ayudante sin leer o, ya leído, el caso espera que la central confirme (abre el chat)
    const nuevo = CHAT.sinLeer.has(p.id) && e === 'avisado', responder = paso && !listoConfirmar && !est.pregunta[p.id];
    if (nuevo || listoConfirmar || responder) {
      const tipo = nuevo ? 'nuevo' : listoConfirmar ? 'espera' : 'responder';
      const av = document.createElement('button'); av.type = 'button'; av.className = 'aviso-chat'; av.dataset.tipo = tipo;
      av.textContent = { nuevo: 'Mensaje nuevo', espera: 'Esperando confirmación', responder: 'Responde en el chat' }[tipo]; av.onclick = () => abrirChat(p.id); li.append(av);
    }
    if (e === 'avisado' || e === 'rescate') {
      // «Confirmar evacuación» se habilita recién cuando el ayudante avisó en el chat que va en camino y que ya están a salvo
      const listo = e === 'rescate' || (est.etapa[p.id] || 0) >= PASOS_AYUDANTE.length;
      const ok = document.createElement('button'); ok.className = 'btn chico ok';
      ok.textContent = e === 'rescate' ? 'Rescate oficial confirmó' : 'Confirmar evacuación';
      ok.disabled = !listo;
      if (!listo) ok.title = 'Responde en el chat y espera la confirmación del ayudante';
      ok.onclick = () => confirmar(p.id, 'central');
      const acc = document.createElement('div'); acc.className = 'acciones'; acc.append(ok);
      // chat con el ayudante (el SMS y la llamada de respaldo sin internet están dentro del chat)
      const chat = document.createElement('button'); chat.className = 'btn chico chat-btn'; chat.textContent = 'Chat';
      chat.setAttribute('aria-label', `Chat con ${nombreAyudante(p.guardian)}`);
      if (CHAT.sinLeer.has(p.id)) chat.dataset.nuevo = '';
      chat.onclick = () => abrirChat(p.id);
      acc.append(chat);
      li.append(acc);
    }
    listaP.append(li);
  });
}
pintarPersonas();

// ---------- respuestas en vivo (tiempo REAL, no simulado) ----------
const reloj = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
function aviso(titulo, texto, clase = '') {
  const t = document.createElement('div'); t.className = 'respuesta ' + clase;
  t.innerHTML = `<b>${esc(titulo)}</b><span>${esc(texto)}</span>`;
  $('#respuestas').append(t); setTimeout(() => t.remove(), 9000);
}
function recibido(id) {
  const p = activas().find(x => x.id === id);
  if (!p || est.fase !== 'alerta' || est.personas[id] !== 'avisado' || est.recib[id] != null) return;
  est.recib[id] = Math.round((Date.now() - est.avisoT) / 1000);
  decirChat(id, 'sistema', 'Su celular recibió la alerta.');
  pintarPersonas(); aviso(`${p.nombre}: aviso recibido`, `El celular de ${p.guardian} sonó · ${reloj(est.recib[id])} tras el aviso`, 'recib');
}
const PUESTOS = { bermejo: 'Bermejo', espejos: 'río Espejos', samaipata: 'Samaipata', angostura: 'La Angostura' };
function vigiaCelular(m) {
  const v = String(m.v || '').slice(0, 20); if (!v) return;
  const lugar = PUESTOS[m.puesto] || 'río arriba';
  if (!est.vigiasCel.has(v)) {
    est.vigiasCel.add(v); est.vecinos.vigias++;
    $('#v-vecinos').dataset.extra = `${est.vecinos.vigias} vigía${est.vecinos.vigias > 1 ? 's' : ''} río arriba: «el río creció» (último: ${lugar})`;
    // por Telegram llega lo que dijo el vigía en su audio (transcrito en el nodo comunitario)
    const dicho = m.via === 'telegram' && m.texto ? String(m.texto).replace(/^Telegram: /, '').slice(0, 160) + ' · ' : '';
    aviso(`Vigía en ${lugar}: «el río creció»`, dicho + (est.vecinos.vigias >= 2 ? 'Segundo vigía: se lanza la alerta' : 'Falta un segundo vigía para lanzar la alerta'), 'vigia');
    evaluar();
  }
  // acuse al vigía: un vigía repetido no suma, pero sí recibe respuesta
  canal.enviar({ tipo: 'vigia-ok', v, n: est.vecinos.vigias }, { titulo: 'Reporte recibido', texto: `Vigías activos: ${est.vecinos.vigias}`, prioridad: 1 });
}
function respuestaEnVivo(id) {
  const p = activas().find(x => x.id === id), r = est.resp[id], cel = r.desde === 'celular';
  const t = document.createElement('div'); t.className = 'respuesta' + (cel ? ' cel' : '');
  t.innerHTML = `<b>${esc(p.nombre)}: evacuado</b><span>${cel ? `${esc(p.guardian)} confirmó desde su celular` : 'evacuación confirmada en la central'} · ${reloj(r.seg)} tras el aviso</span>`;
  $('#respuestas').append(t); setTimeout(() => t.remove(), 9000);
}

// ---------- canal con guardianes ----------
const canal = abrirCanal(tema, m => {
  if (m.tipo === 'ok' && m.id) confirmar(m.id, 'celular');
  if (m.tipo === 'recibido' && m.id) recibido(m.id);
  if (m.tipo === 'vigia') vigiaCelular(m);
  if (m.tipo === 'reg') traerJunta();
});
const PUBLICA = 'https://neckhurtttt.github.io/el-rio-suena/';
function urlGuardian(id) { const u = new URL('guardian.html', /^(localhost|127\.|192\.168\.)/.test(location.hostname) || location.protocol === 'file:' ? PUBLICA : location.href); const s = new URLSearchParams({ t: tema, p: id }), per = todas().find(x => x.id === id);
  if (per && !per.demo) { s.set('n', per.nombre); s.set('b', per.barrio); s.set('cu', per.cuadra); s.set('nec', per.necesidad); s.set('g', per.guardian); }
  else if (per) { s.set('n', per.nombre); s.set('g', per.guardian); } // persona de ejemplo: nombre y ayudante sorteados viajan en el QR para que el celular muestre los mismos
  u.search = '?' + s; return u.href; }
function avisarGuardianes() {
  est.avisoT = Date.now(); est.resp = {}; est.recib = {};
  // aviso general: cualquier vecino (no solo los guardianes) calcula cuándo llega el agua a su barrio
  canal.enviar({ tipo: 'crecida', i: est.intensidad.toFixed(2), lag: Math.round(est.lag), sim: Math.round(est.simMin) },
    { titulo: 'Crecida del Piraí', texto: 'El río viene crecido desde La Angostura. Abre la app para ver cuándo llega a tu barrio.', prioridad: 4 });
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
  iniciarChats();
  pintarPersonas();
}
function confirmar(id, desde) {
  // solo se confirma a quien fue avisado: ignora toques viejos o de otro simulacro
  if (est.fase !== 'alerta' || !['avisado', 'rescate'].includes(est.personas[id])) return;
  est.personas[id] = 'salvo';
  clearTimeout(est.chatTimer[id]); delete est.chatTimer[id]; CHAT.escribiendo.delete(id); pararApuro(id); CHAT.sinLeer.delete(id);
  if (desde === 'celular') {
    // confirmó desde su celular («Ya la ayudé»): en el chat queda su «¡Listo!» aunque no hubiera escrito antes
    if ((est.etapa[id] || 0) < PASOS_AYUDANTE.length) { est.etapa[id] = PASOS_AYUDANTE.length; decirChat(id, 'ayudante', '¡Listo! Ya estamos a salvo.'); }
    decirChat(id, 'sistema', 'Confirmó desde su celular: evacuado.');
  } else decirChat(id, 'sistema', 'Evacuación confirmada en la central.');
  est.resp[id] = { seg: Math.round((Date.now() - est.avisoT) / 1000), desde };
  pintarPersonas(); respuestaEnVivo(id);
  { const pb = activas().find(x => x.id === id), bb = BARRIOS.find(x => x.id === pb.barrio); est.margen[id] = Math.round(minutosHasta(bb, est.intensidad, est.lag) - est.simMin); }
  const p = activas().find(x => x.id === id);
  hablar(`${p.nombre} está a salvo.`);
  if (desde === 'central') canal.enviar({ tipo: 'ok', id }, { titulo: `${p.nombre}: evacuado`, texto: 'Evacuación confirmada desde la central' });
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
  est.alertaDesde = { t: new Date().toISOString(), fuente };
  $('#btn-falsa').hidden = false;
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
    // sin paso automático a «al rescate»: cada caso queda abierto hasta que la central confirme la evacuación
  });
  if (cambio) pintarPersonas();
  // mensajes de emergencia: se encolan al cambiar el estado de cada tramo (con la hora en que pasó)
  // y salen de a uno, con tiempo para leerlos
  const nuevos = mensajesNuevos({ simMin: est.simMin, lag: est.lag, intensidad: est.intensidad }, msjSalieron);
  if (nuevos.length) {
    const sello = { hora: new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }), sim: Math.floor(est.simMin), modo: est.escenario ? 'Simulacro' : 'Alerta real' };
    nuevos.forEach(m => colaMsj.push({ ...m, ...sello }));
    programarMsj();
  }
}, 250);

// ---------- mensajes de emergencia por tramo del río ----------
// Sin scroll: una pila de tarjetas. La activa queda quieta su tiempo de lectura y la nueva entra desde
// arriba, encima; las 2 anteriores asoman detrás (tocarlas las trae al frente para releerlas).
const MSJ_LECTURA = { aviso: 6000, alerta: 6000, desborde: 7000 }, MSJ_APURO_MS = 5000; // con cola larga, 5 s
const MSJ_HIST = 60, MSJ_PILA = 3, MSJ_SALIDA_MS = 400, MSJ_REVISION_MS = 8000;
const NIVEL_MSJ = { aviso: { rango: 1, txt: 'aviso', e: 'vigilancia' }, alerta: { rango: 2, txt: 'alerta', e: 'alerta' }, desborde: { rango: 3, txt: 'desborde', e: 'crecida' } };
const pilaMsj = $('#pila-msj'), estadoMsj = $('#estado-msj');
const msjSalieron = new Set(), salidasMsj = new Set();
let colaMsj = [], histMsj = [], verMsj = -1, rangoMsj = 0, listoMsj = 0, timerMsj = null, revisionMsj = null, encimaMsj = false;
const PIN = '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
// avatar de quien reporta: la misma silueta gris SILUETA de Vecinos Ayudantes (arriba); los avisos automáticos llevan una onda
const ONDA = '<svg viewBox="0 0 24 24"><path d="M3 10c3-3 5 3 9 0s6 3 9 0M3 16c3-3 5 3 9 0s6 3 9 0"/></svg>';
function tarjetaMsj(m, i) {
  const n = NIVEL_MSJ[m.nivel], q = m.quien;
  const el = document.createElement('article'); el.className = 'tarjeta'; el.dataset.n = m.nivel; el.dataset.i = i;
  el.innerHTML = `<span class="av${q.sistema ? ' sistema' : ''}" aria-hidden="true">${q.sistema ? ONDA : SILUETA[q.g] || SILUETA.m}</span>
    <div class="cuerpo">
      <div class="cab"><span class="quien"><b>${esc(q.nombre)}</b><small>${esc(q.rol)}</small></span><span class="nivel">${n.txt}</span></div>
      <span class="lugar">${PIN}${esc(m.zona.nombre)}${m.zona.km != null ? ` · km ${String(m.zona.km).replace('.', ',')}` : ''}</span>
      <span class="texto">${esc(m.texto)}</span>
      <span class="hora">${m.modo} · +${formatoTiempo(m.sim).replace('ya llegó', '0 min')} · ${m.hora}</span>
    </div>`;
  // la activa lleva al mapa; una que asoma detrás pasa al frente para releerla
  el.onclick = () => { const k = Number(el.dataset.i); if (k === verMsj) mapa.volar(m.zona); else irMsj(k); };
  el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.onclick(); } };
  return el;
}
/** Dibuja la pila terminando en el mensaje verMsj. Reutiliza las tarjetas que ya están para que se deslicen. */
function pintarPila() {
  const quiero = [];
  for (let k = verMsj; k >= 0 && quiero.length < MSJ_PILA; k--) quiero.push(k);
  const hay = new Map([...pilaMsj.querySelectorAll('.tarjeta:not([data-pos="arriba"]):not([data-pos="fondo"])')].map(el => [Number(el.dataset.i), el]));
  hay.forEach((el, k) => {
    if (quiero.includes(k)) return;
    el.dataset.pos = k > verMsj ? 'arriba' : 'fondo'; // una más nueva sale hacia arriba; una vieja se apaga atrás
    el.inert = true;
    const t = setTimeout(() => { salidasMsj.delete(t); el.remove(); }, MSJ_SALIDA_MS); salidasMsj.add(t);
  });
  quiero.forEach((k, pos) => {
    let el = hay.get(k);
    if (!el) {
      el = tarjetaMsj(histMsj[k], k);
      el.dataset.pos = pos === 0 ? 'arriba' : 'fondo'; // entra desde arriba (o aparece detrás al revisar)
      pilaMsj.append(el);
      void el.offsetWidth; // fija el estado inicial para que la transición corra
    }
    el.dataset.pos = pos;
    const activa = pos === 0;
    el.tabIndex = activa ? 0 : -1;
    el.setAttribute('aria-hidden', activa ? 'false' : 'true');
    el.title = activa ? 'Ver en el mapa' : 'Volver a leer este mensaje';
  });
}
const pausadoMsj = () => encimaMsj || verMsj < histMsj.length - 1;
/** Un solo temporizador: muestra el siguiente de la cola cuando el activo ya tuvo su tiempo de lectura. */
function programarMsj() {
  if (timerMsj || !colaMsj.length) return;
  timerMsj = setTimeout(() => {
    timerMsj = null;
    if (pausadoMsj()) return; // se retoma al salir del mensaje o al volver al último
    siguienteMsj(); programarMsj();
  }, Math.max(0, listoMsj - performance.now()));
}
function siguienteMsj() {
  const m = colaMsj.shift();
  histMsj.push(m);
  if (histMsj.length > MSJ_HIST) { histMsj.shift(); pilaMsj.querySelectorAll('.tarjeta').forEach(el => { el.dataset.i = Number(el.dataset.i) - 1; }); }
  verMsj = histMsj.length - 1;
  listoMsj = performance.now() + (colaMsj.length > 2 ? MSJ_APURO_MS : MSJ_LECTURA[m.nivel]);
  $('#msj-vacio').hidden = true;
  const n = NIVEL_MSJ[m.nivel];
  if (n.rango > rangoMsj) { rangoMsj = n.rango; estadoMsj.dataset.e = n.e; estadoMsj.textContent = n.txt; }
  pintarPila();
}
/** Releer una carta de abajo (tocándola): pausa la cola y a los pocos segundos vuelve sola al último. */
function irMsj(k) {
  verMsj = Math.max(0, Math.min(histMsj.length - 1, k));
  clearTimeout(revisionMsj); revisionMsj = null;
  if (verMsj < histMsj.length - 1) revisionMsj = setTimeout(() => { revisionMsj = null; irMsj(histMsj.length - 1); }, MSJ_REVISION_MS);
  pintarPila(); programarMsj();
}
// con el mouse encima no cambia: se puede leer tranquilo (solo mouse: en táctil no hay «salir» y quedaría en pausa)
pilaMsj.onpointerenter = e => { if (e.pointerType === 'mouse') encimaMsj = true; };
pilaMsj.onpointerleave = e => { if (e.pointerType === 'mouse') { encimaMsj = false; programarMsj(); } };
/** Reiniciar / falsa alarma: corta temporizadores, saca las tarjetas (también las que estaban saliendo) y vacía la cola. */
function limpiarMsj() {
  clearTimeout(timerMsj); timerMsj = null;
  clearTimeout(revisionMsj); revisionMsj = null;
  salidasMsj.forEach(clearTimeout); salidasMsj.clear();
  msjSalieron.clear(); colaMsj = []; histMsj = []; verMsj = -1; rangoMsj = 0; listoMsj = 0;
  pilaMsj.replaceChildren(); $('#msj-vacio').hidden = false;
  estadoMsj.dataset.e = 'normal'; estadoMsj.textContent = 'sin reportes';
}

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
  est.fase = 'espera'; est.simMin = 0; est.lag = 0; est.intensidad = 1; est.regla = null; est.escenario = null; est.vecinos = { crecido: 0, desborde: 0, vigias: 0 }; est.vigiasCel = new Set();
  delete $('#v-vecinos').dataset.extra; evaluar();
  limpiarChats(); // mensajes y respuestas pendientes del ayudante (sus timers ya se cancelaron arriba)
  activas().forEach(p => est.personas[p.id] = 'tranquilo'); pintarPersonas();
  BARRIOS.forEach(b => { const li = $('#b-' + b.id); li.dataset.e = 'tranquilo'; li.querySelector('.tiempo').textContent = 'sin crecida'; li.querySelector('.barra-t i').style.width = 0; li.querySelector('.info').textContent = `${b.km} km río abajo de La Angostura`; mapa.barrio(b.id, 'sin alerta', 'tranquilo'); });
  mapa.crecida(0); mapa.sensor(''); mapa.general();
  $('#confianza').hidden = true; $('#chip-reloj').hidden = true; $('#exito').hidden = true; $('#btn-falsa').hidden = true;
  limpiarMsj();
}
// ---------- falsa alarma: la junta verificó el río y no hay crecida ----------
// se cancela en todos los celulares (sirena apagada, pantalla verde con el motivo) y queda en el registro de alertas
function falsaAlarma() {
  if (est.fase !== 'alerta') return;
  const motivo = 'La junta verificó el río y está normal.';
  canal.enviar({ tipo: 'cancelar' }, { titulo: 'Alerta cancelada', texto: `Falsa alarma. ${motivo} Gracias por estar atentos.`, prioridad: 4 });
  try {
    const r = JSON.parse(localStorage.getItem('rs-alertas') || '[]');
    r.push({ ...est.alertaDesde, cancelada: new Date().toISOString(), motivo, respondieron: Object.keys(est.resp || {}).length });
    localStorage.setItem('rs-alertas', JSON.stringify(r.slice(-100)));
  } catch {}
  reiniciar();
  $('#detalle-riesgo').textContent = `Alerta cancelada: falsa alarma. ${motivo} Se avisó a todos los celulares y quedó en el registro para ajustar los umbrales.`;
  hablar('Alerta cancelada. Falsa alarma. El río está normal.');
}
$('#btn-falsa').onclick = falsaAlarma;

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
function urlVigia() { const u = new URL('vigia.html', /^(localhost|127\.|192\.168\.)/.test(location.hostname) || location.protocol === 'file:' ? PUBLICA : location.href); u.search = '?' + new URLSearchParams({ t: tema }); return u.href; }
$('#btn-qr-vigia').onclick = () => {
  if ($('#dlg-qr').open) return;
  $('#dlg-qr h3').textContent = 'Sé vigía río arriba';
  const url = urlVigia(), q = $('#qr'); q.innerHTML = '';
  try { new QRCode(q, { text: url, width: 300, height: 300, colorDark: '#071219', colorLight: '#ffffff' }); } catch { q.textContent = 'QR no disponible'; }
  $('#qr-link').textContent = url; $('#qr-tema').textContent = tema;
  $('#dlg-qr').showModal();
};
function abrirQR(id) {
  if ($('#dlg-qr').open) return;
  const per = todas().find(x => x.id === id);
  $('#dlg-qr h3').textContent = `Sé ayudante de ${per?.nombre || activas()[0]?.nombre || '…'}`;
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
  $('#respuestas').replaceChildren(); $('#exito').hidden = false; hablar('Todos a salvo.'); oido.detener();
  est.fase = 'fin'; $('#exito-cerrar').focus();
}
$('#exito-cerrar').onclick = () => { $('#exito').hidden = true; mapa.general(); };

// voz
function hablar(t) {
  try { const u = new SpeechSynthesisUtterance(traducir(t)); u.lang = vozActual(); u.rate = 1.02; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch {}
}

// ---------- vigía: escaneo de datos abiertos + reportes ----------
const fmt = x => x.toFixed(x < 10 ? 1 : 0).replace('.', ',');
function evaluar() {
  const d = est.escenario || est.lluvia; if (!d) return;
  const idx = indiceRiesgo({ ll6: d.ll6, ll24: d.ll24, prox6: d.prox6, caudal: d.caudalPico, ...est.vecinos, oficial: est.oficial?.nivel });
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
    else if (idx.fuente === 'senamhi') alerta(idx.intensidad, 'aviso rojo de SENAMHI', LAG_CUENCA_MIN);
    else alerta(idx.intensidad, 'datos abiertos de la cuenca alta', LAG_CUENCA_MIN);
  }
  if (est.fase !== 'alerta') $('#detalle-riesgo').textContent = idx.fuente === 'senamhi' && idx.estado === 'vigilancia'
    ? `Vigilancia por el aviso oficial: SENAMHI prevé amenaza ${est.oficial.nivel} en la cuenca del Piraí. Revisen la regla y tengan lista la mochila.`
    : idx.estado === 'vigilancia'
    ? 'Vigilancia: el riesgo sube. Pedimos a los vecinos de la ribera foto de la regla.'
    : 'La lluvia en Samaipata y Bermejo tarda unas 2 h 30 min en bajar hasta La Angostura: ese es el tiempo que ganamos.';
}
// aviso oficial de SENAMHI (boletín diario procesado en datos/senamhi.json)
async function oficial() {
  est.oficial = amenazaHoy(await cargarSenamhi('datos/senamhi.json'));
  const el = $('#oficial'); if (!el) return;
  el.hidden = !est.oficial; if (!est.oficial) return;
  el.dataset.n = est.oficial.nivel;
  el.querySelector('span').textContent = textoOficial(est.oficial);
  const a = el.querySelector('a'); a.hidden = !est.oficial.url; if (est.oficial.url) a.href = est.oficial.url;
}
async function escaneo() {
  await oficial();
  // primero la PC del equipo (vigía central); si no hay lectura fresca, el navegador escanea solo
  let l = null;
  if (hayNube()) { try { l = deLectura(await vigiaCentral.ultima()); } catch {} }
  if (!l) l = await escanear();
  est.lluvia = l;
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
    msg.textContent = ok ? `✓ ${d.nombre} llegó al registro de la junta vecinal. Cuando lo aprueben, su ayudante recibe las alertas.`
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
    if (p.aprobado && !p.demo) { const b = document.createElement('button'); b.className = 'btn chico'; b.textContent = 'QR ayudante'; b.onclick = () => { $('#dlg-junta').close(); abrirQR(p.id); }; acc.append(b); }
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
$('#btn-repetir').onclick = () => hablar($('#detalle-riesgo').textContent + ' ' + [...document.querySelectorAll('#lista-barrios li')].map(li => li.querySelector('.nombre').textContent + ': ' + (idiomaActual() === 'es' ? li.querySelector('.tiempo').textContent.replace('h', 'horas').replace('min', 'minutos') : li.querySelector('.tiempo').textContent)).join('. '));

// ---------- funciona sin internet (PWA) ----------
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
addEventListener('offline', () => document.body.classList.add('sin-red'));
addEventListener('online', () => document.body.classList.remove('sin-red'));

if (JURADO) { $('#btn-simulacro').classList.add('late'); document.title = 'El Río Suena · demo'; }
window.__rs = { est, alerta, confirmar, oido, mapa, evaluar, activas, riada, abrirChat, pasoAyudante }; // para pruebas
