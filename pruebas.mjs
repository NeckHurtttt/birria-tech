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

// ---------- recolector (PC del equipo) ----------
import { calcularFila, decidirAlerta, mensajeAlerta, encolar, leerCola, vaciarCola, REARME } from './recolector/nucleo.mjs';
import { lecturaComoEscaneo, VIGENCIA_MIN } from './js/nube.js';
import { UMBRAL_ALERTA } from './js/datos.js';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const TORMENTA_R = { vivo: true, ll6: 46, ll24: 64, prox6: 30, prox24: 45, caudal: 30, caudalPico: 58 };
t('recolector: fila calculada con el índice y los minutos por barrio de la app', () => {
  const f = calcularFila(TORMENTA_R, new Date('2026-11-21T20:00:00Z'));
  assert.equal(f.creado_en, '2026-11-21T20:00:00.000Z');
  assert.equal(f.nivel, 'alerta'); assert.ok(f.indice >= UMBRAL_ALERTA * 100);
  assert.equal(f.caudal, 58); assert.equal(f.origen, 'pc');
  assert.equal(f.barrios.length, 5); assert.ok(f.barrios.every(b => b.minutos > 0));
  assert.ok(f.barrios[0].minutos < f.barrios[4].minutos); // río abajo llega después
  assert.equal(calcularFila({ ...TORMENTA_R, vivo: false }), null); // el respaldo inventado no se sube
  assert.equal(calcularFila({ ...TORMENTA_R, lluviaVivo: true }).origen, 'pc-parcial'); // GloFAS falló: caudal de respaldo
  assert.equal(calcularFila({ ...TORMENTA_R, lluviaVivo: true, caudalVivo: true }).origen, 'pc');
  assert.equal(calcularFila({ vivo: true, ll6: 0, ll24: 1, prox6: 0, caudal: 7, caudalPico: 8 }).nivel, 'normal');
});
t('recolector: la alerta se publica una sola vez por evento', () => {
  let e = {}, publicadas = 0;
  for (const i of [20, 60, 70, 65, 50, 60, 30, 70]) { const d = decidirAlerta(e, i); if (d.publicar) publicadas++; e = d.estado; }
  // 60 publica; 70, 65 no; 50 no rearma (está sobre el margen); 60 no; 30 rearma; 70 publica de nuevo
  assert.equal(publicadas, 2);
  assert.ok(REARME < UMBRAL_ALERTA);
  const m = mensajeAlerta(calcularFila(TORMENTA_R), 'rio suena!');
  assert.equal(m.topic, 'riosuena'); assert.deepEqual(deTags(m.tags).tipo, 'lectura');
});
{ // async: se espera con await de nivel superior antes de comprobar
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rs-')), cola = path.join(dir, 'pendientes.jsonl');
  [1, 2, 3].forEach(n => encolar(cola, { n }));
  fs.appendFileSync(cola, 'línea rota\n'); // una línea corrupta no rompe la cola
  const subidas = [];
  const r1 = await vaciarCola(cola, async f => { if (f.n === 2) throw Error('sin red'); subidas.push(f.n); });
  const tras1 = leerCola(cola).map(f => f.n);
  const r2 = await vaciarCola(cola, async f => { subidas.push(f.n); });
  t('recolector: cola de pendientes en orden y sin perder filas', () => {
    assert.equal(r1.subidas, 1); assert.equal(r1.quedan, 2); assert.deepEqual(tras1, [2, 3]);
    assert.deepEqual(subidas, [1, 2, 3]); assert.equal(r2.quedan, 0); assert.equal(fs.existsSync(cola), false);
  });
}
t('app: usa la lectura del recolector solo si tiene menos de 20 min', () => {
  const ahora = Date.parse('2026-11-21T20:00:00Z'), fila = calcularFila(TORMENTA_R, new Date(ahora - 5 * 60000));
  const l = lecturaComoEscaneo(fila, ahora);
  assert.equal(l.fuente, 'Vigía central (PC del equipo)'); assert.equal(l.caudalPico, 58); assert.equal(l.vivo, true);
  assert.equal(lecturaComoEscaneo({ ...fila, creado_en: new Date(ahora - (VIGENCIA_MIN + 1) * 60000).toISOString() }, ahora), null);
  assert.equal(lecturaComoEscaneo(undefined, ahora), null);
});
console.log('recolector ok');
import { registrar as anotar } from './recolector/nucleo.mjs';
t('recolector: el registro rota al pasar el tamaño máximo', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rs-')), log = path.join(dir, 'registro.log');
  anotar(log, 'a'.repeat(50), 40); anotar(log, 'b', 40);
  assert.ok(fs.existsSync(log + '.1')); assert.match(fs.readFileSync(log, 'utf8'), / b\n$/);
});
console.log('registro ok');
