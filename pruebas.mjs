import assert from 'node:assert/strict';
import { BARRIOS, KM_TOTAL, minutosHasta, alturaEn, formatoTiempo, confianza, nivelDeRegla, tramoHasta } from './js/datos.js';
import { aTags, deTags, limpiarTema, memoriaAcotada } from './js/canal.js';
let n = 0; const t = (nombre, f) => { f(); n++; console.log('ok -', nombre); };
t('barrios ordenados río abajo', () => BARRIOS.reduce((a, b) => (assert.ok(b.km > a), b.km), 0));
t('más intensidad llega antes', () => BARRIOS.forEach(b => assert.ok(minutosHasta(b, 4) < minutosHasta(b, 1))));
t('altura crece con intensidad', () => BARRIOS.forEach(b => assert.ok(alturaEn(b, 4) > alturaEn(b, 1.5))));
t('formato de tiempo', () => { assert.equal(formatoTiempo(220), '3 h 40 min'); assert.equal(formatoTiempo(45), '45 min'); assert.equal(formatoTiempo(0), 'ya llegó'); });
t('confianza con lluvia', () => { assert.equal(confianza(30, 2).nivel, 'alta'); assert.equal(confianza(8, 2).nivel, 'media'); assert.equal(confianza(0, 1.5).nivel, 'baja'); });
t('lectura de regla', () => { assert.equal(nivelDeRegla(1000, 400, 3, 640), 1.8); assert.equal(nivelDeRegla(400, 1000, 3, 500), null); });
t('tramo de crecida', () => { assert.equal(tramoHasta(0).length, 1); assert.ok(tramoHasta(KM_TOTAL).length >= 10); });
t('tags ida y vuelta', () => assert.deepEqual(deTags(aTags({ tipo: 'ok', id: 'rosa' })), { tipo: 'ok', id: 'rosa' }));
t('tags ajenos se ignoran', () => { assert.equal(deTags(undefined), null); assert.equal(deTags(['otro']), null); assert.deepEqual(deTags(['rs', 5, 'id=a=b']), { id: 'a=b' }); });
t('tema de ntfy saneado', () => { assert.equal(limpiarTema('rio suena/../x?'), 'riosuenax'); assert.equal(limpiarTema(null), ''); assert.equal(limpiarTema('a'.repeat(99)).length, 64); });
t('memoria de mensajes acotada', () => { const m = memoriaAcotada(3); ['a', 'b', 'c', 'd'].forEach(k => m.add(k)); assert.equal(m.size, 3); assert.ok(!m.has('a') && m.has('d')); });
console.log(`${n} pruebas ok`);
import { indiceRiesgo } from './js/datos.js';
t('índice: hoy normal, tormenta alerta, vecinos solos no alertan', () => {
  assert.equal(indiceRiesgo({ ll6: 0, ll24: 3, caudal: 7.6 }).estado, 'normal');
  assert.equal(indiceRiesgo({ ll6: 46, ll24: 64, prox6: 30, caudal: 30, crecido: 1 }).estado, 'alerta');
  assert.notEqual(indiceRiesgo({ crecido: 5, desborde: 5 }).estado, 'alerta');
});
console.log('índice ok');
import { repetirRiada } from './js/datos.js';
import { RIADA_2025 } from './js/historico.js';
t('2 vigías río arriba alertan; 1 solo es vigilancia', () => {
  assert.equal(indiceRiesgo({ vigias: 2 }).estado, 'alerta');
  assert.equal(indiceRiesgo({ vigias: 2 }).fuente, 'vigias');
  assert.equal(indiceRiesgo({ vigias: 1 }).estado, 'vigilancia');
});
t('riada 13/12/2025: modelos solos no alertan, con vigías sí y antes del desborde', () => {
  const r = repetirRiada(RIADA_2025);
  assert.equal(r.alertaSolo, null);
  assert.ok(r.alertaCon && r.alertaCon < RIADA_2025.desborde);
  assert.ok(r.ventajaMin >= 120, 'ventaja ' + r.ventajaMin);
  console.log('   riada 2025:', r.lluviaTotal.toFixed(1), 'mm vistos, riesgo máx solo', Math.round(r.maxSolo * 100), '· alerta con vigías', r.alertaCon, '· ventaja', r.ventajaMin, 'min');
});
console.log('riada ok');
import { readFileSync, existsSync } from 'node:fs';
import { limpiarTel, aCSV } from './js/registro.js';
t('el service worker guarda archivos que existen', () => {
  const lista = [...readFileSync('sw.js', 'utf8').matchAll(/["']([\w./-]+\.(?:js|css|html|svg|png|woff2|webmanifest))["']/g)].map(m => m[1]).filter(f => f !== 'sw.js');
  assert.ok(lista.length > 15); lista.forEach(f => assert.ok(existsSync(f), 'falta ' + f));
});
t('teléfono y CSV de la junta', () => {
  assert.equal(limpiarTel('71234567'), '+59171234567'); assert.equal(limpiarTel('+591 7123 4567'), '+59171234567');
  const csv = aCSV([{ id: 'a', nombre: 'Rosa "la abuela"', barrio: 'eltorno', cuadra: 'C4', guardian: 'Marcelo', aprobado: true }], { a: 'salvo' }, () => 'El Torno');
  assert.ok(csv.includes('"Rosa ""la abuela"""') && csv.includes('"a salvo"') && csv.includes(';'));
});
console.log('pwa y registro ok');
import { t as tr } from './js/idioma.js';
t('idioma: textos fijos, con números y compuestos', () => {
  assert.equal(tr('Iniciar simulacro', 'en'), 'Start drill');
  assert.equal(tr('Iniciar simulacro', 'zh'), '开始演练');
  assert.equal(tr('Iniciar simulacro', 'es'), 'Iniciar simulacro');
  assert.equal(tr('2 h 05 min', 'zh'), '2 小时 05 分');
  assert.equal(tr('agua 1,2 m', 'en'), 'water 1.2 m');
  assert.equal(tr('El Torno, Cuadra 4 · silla de ruedas', 'en'), 'El Torno, Block 4 · wheelchair user');
  assert.equal(tr('texto que no está en el diccionario', 'en'), 'texto que no está en el diccionario');
});
console.log('idioma ok');
import { filaLectura, deLectura, FRESCA_MIN } from './js/nube.js';
t('vigía central: fila y lectura fresca', () => {
  const l = { ll6: 3.14, ll24: 20.06, prox6: 1, prox24: 2, caudal: 7.6, caudalPico: 8.1, vivo: true, puntos: [{ nombre: 'Samaipata', ll24: 5.55, ll6: 1 }] };
  const f = filaLectura(l, { r: 0.427, estado: 'normal' }, new Date('2026-11-21T12:00:00Z'));
  assert.equal(f.indice, 43); assert.equal(f.ll6, 3.1); assert.equal(f.caudal_pico, 8.1);
  assert.deepEqual(f.puntos, [{ nombre: 'Samaipata', ll24: 5.6 }]);
  const ahora = Date.parse('2026-11-21T12:10:00Z');
  const d = deLectura(f, ahora);
  assert.equal(d.caudalPico, 8.1); assert.equal(d.mm24, f.ll24); assert.equal(d.central, true); assert.equal(d.minutos, 10);
  assert.equal(deLectura({ ...f, medido_en: '2026-11-21T11:30:00Z' }, ahora), null, `más de ${FRESCA_MIN} min = vieja`);
  assert.equal(deLectura(null, ahora), null);
});
const { leerEnv, debeAvisar } = await import('./recolector/recolector.mjs');
t('recolector: .env y alerta una sola vez por evento', () => {
  assert.deepEqual(leerEnv('# c\r\nRECOLECTOR=pc-rodrigo\r\nTOKEN="abc"\nNTFY_TEMA=\n'), { RECOLECTOR: 'pc-rodrigo', TOKEN: 'abc', NTFY_TEMA: '' });
  assert.equal(debeAvisar('normal', 'alerta'), true);
  assert.equal(debeAvisar('alerta', 'alerta'), false);
  assert.equal(debeAvisar(undefined, 'vigilancia'), false);
});
console.log('vigía central ok');
import { basesNtfy } from './js/canal.js';
t('ntfy: servidor propio primero, ntfy.sh siempre de respaldo, solo https', () => {
  assert.deepEqual(basesNtfy('', ''), ['https://ntfy.sh/']);
  assert.deepEqual(basesNtfy('https://nodo.example.org', ''), ['https://nodo.example.org/', 'https://ntfy.sh/']);
  assert.deepEqual(basesNtfy('', 'https://junta.example.org/'), ['https://junta.example.org/', 'https://ntfy.sh/']);
  assert.deepEqual(basesNtfy('http://otro.example.org', ''), ['https://ntfy.sh/']); // http remoto no
  assert.deepEqual(basesNtfy('http://localhost:8090', ''), ['http://localhost:8090/', 'https://ntfy.sh/']);
});
console.log('ntfy ok');
import { amenazaHoy, textoOficial } from './js/senamhi.js';
import { readFileSync as leerS } from 'node:fs';
t('SENAMHI: amenaza oficial pone piso al índice y se lee del boletín', () => {
  assert.equal(indiceRiesgo({ ll6: 0, ll24: 3, caudal: 7.6, oficial: 'amarilla' }).estado, 'vigilancia');
  assert.equal(indiceRiesgo({ ll6: 0, ll24: 3, caudal: 7.6, oficial: 'naranja' }).fuente, 'senamhi');
  assert.equal(indiceRiesgo({ oficial: 'roja' }).estado, 'alerta');
  assert.equal(indiceRiesgo({ ll6: 46, ll24: 64, prox6: 30, caudal: 30, oficial: 'amarilla' }).fuente, 'lluvia'); // lo propio manda si es mayor
  const s = { boletin: '2026-11-20', tramos: { alta: [{ fecha: '2026-11-21', amenaza: 'amarilla', tendencia: 'ascensos' }, { fecha: '2026-11-23', amenaza: 'naranja', tendencia: 'ascensos' }], baja: [{ fecha: '2026-11-21', amenaza: 'sin', tendencia: 'poco variable' }] } };
  const a = amenazaHoy(s, new Date(2026, 10, 21, 10));
  assert.equal(a.nivel, 'amarilla'); assert.equal(a.sube.nivel, 'naranja');
  assert.match(textoOficial(a), /amarilla.*sube a naranja/);
  assert.equal(amenazaHoy(s, new Date(2026, 10, 30)), null); // boletín vencido
  assert.equal(amenazaHoy(null), null);
  const real = JSON.parse(leerS('./datos/senamhi.json', 'utf8'));
  assert.equal(Object.values(real.tramos).every(d => d.length === 14 && d.every(x => x.amenaza)), true);
});
console.log('senamhi ok');
import { mensajesNuevos } from './js/mensajes.js';
t('mensajes de emergencia: progresivos río abajo, sin repetir', () => {
  const s = new Set(), cero = () => 0, lag = 150, i = 2;
  const ini = mensajesNuevos({ simMin: 0, lag, intensidad: i }, s, cero);
  assert.deepEqual(ini.map(m => m.clave), ['cuenca']);
  assert.equal(mensajesNuevos({ simMin: 0, lag, intensidad: i }, s, cero).length, 0);
  const paso = mensajesNuevos({ simMin: lag, lag, intensidad: i }, s, cero).map(m => m.clave);
  assert.ok(paso.includes('vigia') && paso.includes('paso-angostura'));
  const torno = BARRIOS.find(b => b.id === 'eltorno'), llega = minutosHasta(torno, i, lag);
  const antes = mensajesNuevos({ simMin: llega - 1, lag, intensidad: i }, s, cero);
  assert.ok(antes.some(m => m.clave === 'evacuar-eltorno' && m.nivel === 'alerta'));
  assert.ok(!antes.some(m => m.clave === 'llego-eltorno'));
  const ya = mensajesNuevos({ simMin: llega, lag, intensidad: i }, s, cero).find(m => m.clave === 'llego-eltorno');
  assert.equal(ya.nivel, 'desborde'); assert.match(ya.texto, /El Torno/);
  const fin = mensajesNuevos({ simMin: 1e4, lag, intensidad: i }, s, cero);
  assert.ok(!fin.some(m => m.clave === 'paso-portachuelo'), 'el último tramo no "pasa hacia" nada');
  assert.ok(fin.every(m => !/\{\w+\}/.test(m.texto)), 'sin marcadores sin rellenar');
});
console.log('mensajes ok');
t('cada mensaje dice quién lo manda', () => {
  const todos = mensajesNuevos({ simMin: 1e4, lag: 150, intensidad: 2 }, new Set(), () => 0);
  assert.ok(todos.every(m => m.quien && m.quien.nombre && m.quien.rol && (m.quien.sistema || ['f', 'm'].includes(m.quien.g))));
  assert.ok(todos.find(m => m.clave === 'cuenca').quien.sistema, 'el aviso de lluvia es automático');
  assert.ok(!todos.find(m => m.clave === 'llego-eltorno').quien.sistema, 'el desborde lo reporta un vecino');
});
import { nombresAleatorios, NOMBRES_DEMO, PERSONAS } from './js/datos.js';
t('nombres sorteados: sin repetir, con tratamiento y sin nombre fijo', () => {
  const vistos = new Set();
  for (let k = 0; k < 40; k++) {
    const n = nombresAleatorios(PERSONAS);
    assert.equal(new Set(Object.values(n)).size, PERSONAS.length, 'no repite dentro de una central');
    assert.match(n.rosa, /^Doña \S/); assert.match(n.teo, /^Don \S/); assert.match(n.juana, /^Doña \S/);
    assert.match(n.nina, /^Niños \S+ \([234]\)$|^Familia \S+$/);
    vistos.add(n.rosa);
  }
  assert.ok(vistos.size > 15, 'cambia entre una central y otra');
  const fijo = nombresAleatorios(PERSONAS, () => 0);
  assert.equal(fijo.rosa, 'Doña ' + NOMBRES_DEMO.f[0]); assert.equal(fijo.juana, 'Doña ' + NOMBRES_DEMO.f[1]);
});
import { NOMBRES_FIJOS } from './js/datos.js';
t('el sorteo nunca devuelve los nombres fijos de antes (Doña Rosa, Don Teodoro…)', () => {
  assert.ok(NOMBRES_FIJOS.includes('Doña Rosa'));
  for (let k = 0; k < 500; k++) Object.values(nombresAleatorios(PERSONAS)).forEach(n => assert.ok(!NOMBRES_FIJOS.includes(n), n));
  for (const l of Object.values(NOMBRES_DEMO)) assert.ok(l.every(x => !/\s/.test(x)), 'sin espacios: la traducción de «Niños X (N)» espera una palabra');
});
import { ayudantesAleatorios, NOMBRES_AYUDANTES, NOMBRE_SORTEADO, AYUDANTE_SORTEADO } from './js/datos.js';
t('ayudantes sorteados: variados, sin repetir y con la forma que la central y el celular reconocen', () => {
  const vistos = new Set(), grupos = new Set();
  for (let k = 0; k < 200; k++) {
    const a = ayudantesAleatorios(PERSONAS), n = nombresAleatorios(PERSONAS);
    assert.equal(new Set(Object.values(a)).size, PERSONAS.length, 'no repite ayudante dentro de una central');
    Object.values(a).forEach(x => assert.match(x, AYUDANTE_SORTEADO));
    Object.values(n).forEach(x => assert.match(x, NOMBRE_SORTEADO));
    assert.match(a.nina, /^Profe \S+$/, 'a los niños solos los cuida un profe');
    assert.match(a.rosa, /^\S+ \((vecino|vecina)\)$/);
    vistos.add(a.rosa); grupos.add(n.nina.split(' ')[0]);
  }
  assert.ok(vistos.size > 15, 'los ayudantes cambian entre una central y otra');
  assert.deepEqual([...grupos].sort(), ['Familia', 'Niños'], 'el grupo sale como «Niños X (N)» o «Familia X»');
  // las listas de personas y de ayudantes no se pisan (nunca «Doña Paola» ayudada por «Paola»)
  const personas = new Set([...NOMBRES_DEMO.f, ...NOMBRES_DEMO.m]);
  assert.ok([...NOMBRES_AYUDANTES.f, ...NOMBRES_AYUDANTES.m].every(x => !personas.has(x) && !/\s/.test(x)));
  assert.equal(new Set([...NOMBRES_DEMO.f, ...NOMBRES_DEMO.m, ...NOMBRES_DEMO.apellidos]).size, NOMBRES_DEMO.f.length + NOMBRES_DEMO.m.length + NOMBRES_DEMO.apellidos.length, 'sin duplicados');
});
