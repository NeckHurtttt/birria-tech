// Mensajes de emergencia por tramo del río durante una crecida (simulacro o alerta real).
// Puro: recibe el reloj del simulacro y devuelve los mensajes que "tocan" ahora y aún no salieron.
import { BARRIOS, SENSOR, CUENCA as PUNTOS_CUENCA, minutosHasta, alturaEn, formatoTiempo } from './datos.js';

const pos = n => { const p = PUNTOS_CUENCA.find(x => x.nombre === n); return { lon: p.lon, lat: p.lat }; };
const ANGOSTURA = { id: 'angostura', nombre: 'La Angostura', km: 0, lon: SENSOR.lon, lat: SENSOR.lat };
const CUENCA = { id: 'cuenca', nombre: 'Cuenca alta (Samaipata · Bermejo)', km: null, ...pos('Samaipata') };
const BERMEJO = { id: 'bermejo', nombre: 'Bermejo (río arriba)', km: null, ...pos('Bermejo') };

// variantes por fase: {n} = zona, {sig} = siguiente zona río abajo, {t} = tiempo, {h} = altura
const TEXTOS = {
  cuenca: ['Llueve fuerte río arriba: la crecida bajaría a La Angostura en {t}.'],
  vigia: ['¡El río viene turbio y arrastrando palos en Bermejo! Avisen río abajo.', '¡En Bermejo el Piraí ya ruge y viene cargado de barro!'],
  aviso: ['¡Agua subiendo muy rápido cerca de {n}, busquen zonas altas!', 'En {n} el río ya suena fuerte: suban documentos y animales a lo alto.', '¡{n}: el agua llega en {t}, preparen la salida!'],
  evacuar: ['¡Vecinos de {n}, evacúen la zona baja de inmediato!', '¡{n}: el agua llega en minutos, salgan ya hacia zona alta!'],
  llego: ['¡Vengan rápido! El río se está desbordando en {n}.', '¡Desborde en {n}: ya hay {h} m de agua en la ribera!'],
  paso: ['¡La crecida ya pasó por {n} y viene bajando fuerte hacia {sig}!'],
};
const rellenar = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');

// quién manda cada mensaje: vecinos ficticios del simulacro (en una crecida real serían los vigías dados de alta)
// g: 'f' mujer, 'm' hombre (solo elige la silueta del avatar)
const VECINOS = {
  bermejo: [{ nombre: 'Ramiro Flores', rol: 'vigía río arriba', g: 'm' }, { nombre: 'Elena Vaca', rol: 'vigía río arriba', g: 'f' }],
  angostura: [{ nombre: 'Germán Rojas', rol: 'vigía en el puente', g: 'm' }],
  jorochito: [{ nombre: 'Marta Suárez', rol: 'vecina', g: 'f' }, { nombre: 'Don Lucho Pinto', rol: 'vecino', g: 'm' }, { nombre: 'Carla Justiniano', rol: 'vecina', g: 'f' }],
  eltorno: [{ nombre: 'Jhonny Cuéllar', rol: 'vecino', g: 'm' }, { nombre: 'Doña Inés Paz', rol: 'vecina', g: 'f' }, { nombre: 'Wilson Añez', rol: 'presidente OTB', g: 'm' }],
  porongo: [{ nombre: 'Rosmery Chávez', rol: 'vecina', g: 'f' }, { nombre: 'Fabio Montero', rol: 'vecino', g: 'm' }],
  urubo: [{ nombre: 'Ximena Roca', rol: 'vecina', g: 'f' }, { nombre: 'Diego Saucedo', rol: 'vecino', g: 'm' }],
  portachuelo: [{ nombre: 'Don Hugo Arteaga', rol: 'vecino', g: 'm' }, { nombre: 'Patricia Ortiz', rol: 'vecina', g: 'f' }],
};
const SISTEMA = { nombre: 'Vigía del Piraí', rol: 'aviso automático', sistema: true };

/**
 * Mensajes nuevos que corresponden a este momento de la crecida.
 * @param {{simMin:number, lag:number, intensidad:number}} reloj  minutos simulados desde la alerta
 * @param {Set<string>} salieron  claves ya mostradas (se actualiza)
 * @param {() => number} azar  para elegir variante (tests: () => 0)
 * @returns {{clave:string, zona:object, nivel:'aviso'|'alerta'|'desborde', texto:string, quien:{nombre:string, rol:string, sistema?:boolean}}[]} en orden río abajo
 */
export function mensajesNuevos({ simMin, lag = 0, intensidad = 2 }, salieron, azar = Math.random) {
  const out = [];
  const uno = op => op[Math.floor(azar() * op.length) % op.length];
  const poner = (clave, zona, nivel, fase, v = {}) => {
    if (salieron.has(clave)) return;
    salieron.add(clave);
    const quien = VECINOS[zona.id] ? uno(VECINOS[zona.id]) : SISTEMA;
    out.push({ clave, zona, nivel, quien, texto: rellenar(uno(TEXTOS[fase]), { n: zona.nombre, ...v }) });
  };
  const sig = i => (BARRIOS[i + 1] || {}).nombre;

  // río arriba: la alerta salió de la lluvia o de los vigías, el agua aún no llega a La Angostura
  if (lag > 0) {
    poner('cuenca', CUENCA, 'aviso', 'cuenca', { t: formatoTiempo(Math.round(lag)) });
    if (simMin >= lag - 60) poner('vigia', BERMEJO, 'aviso', 'vigia');
  }
  if (simMin >= lag) poner('paso-angostura', ANGOSTURA, 'alerta', 'paso', { sig: BARRIOS[0].nombre });

  BARRIOS.forEach((b, i) => {
    const resta = Math.round(minutosHasta(b, intensidad, lag) - simMin);
    const h = alturaEn(b, intensidad).toFixed(1).replace('.', ',');
    if (resta <= 60) poner('aviso-' + b.id, b, 'aviso', 'aviso', { t: formatoTiempo(Math.max(1, resta)) });
    if (resta <= 15) poner('evacuar-' + b.id, b, 'alerta', 'evacuar');
    if (resta <= 0) poner('llego-' + b.id, b, 'desborde', 'llego', { h });
    if (resta <= -10 && sig(i)) poner('paso-' + b.id, b, 'alerta', 'paso', { sig: sig(i) });
  });
  return out;
}
