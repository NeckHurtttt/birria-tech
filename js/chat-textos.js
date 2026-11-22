// Textos del chat con el vecino ayudante durante el simulacro: sugerencias de la central, de qué trata cada mensaje
// y la respuesta del ayudante, que tiene que ver con lo que se le preguntó. Sin DOM: se prueba en pruebas.mjs.

const elegir = (lista, azar = Math.random) => lista[Math.floor(azar() * lista.length) % lista.length];

/** Qué asistencia necesita la persona: para preguntar y responder sobre eso (silla, señas, niños, idioma). */
export function tipoAsistencia(p) {
  const nec = String(p.necesidad || '').toLowerCase(), nombre = String(p.nombre || '');
  if (p.g === 'ninos' || /^(Niños|Familia)\s/i.test(nombre) || /niñ|solos/.test(nec)) return 'grupo';
  if (/silla|ruedas|muleta|andador|no camina/.test(nec)) return 'silla';
  if (/no oye|sord|señas/.test(nec)) return 'sordo';
  if (/quechua|guaraní|guarani|aimara|aymara/.test(nec)) return 'idioma';
  return 'general';
}
const idiomaDe = p => (String(p.necesidad || '').match(/quechua|guaraní|guarani|aimara|aymara/i) || ['su idioma'])[0].toLowerCase();
const cuantosDe = p => (String(p.nombre || '').match(/\((\d+)\)\s*$/) || [])[1];
// nombre sin «Doña/Don/Niños/Familia» ni «(3)», para reconocerlo en lo que escribe la central
const nombreSuelto = p => String(p.nombre || '').toLowerCase().replace(/^(doña|don|niños|familia)\s+/, '').replace(/\s*\(\d+\)\s*$/, '').trim();

/**
 * De qué trata un mensaje de la central: 'paso' (salida/puente), 'agua' (calle/nivel), 'persona' (la persona asistida),
 * 'alto' (zona alta/lugar seguro) o 'general'. Sirve para respuestas rápidas y para texto escrito a mano.
 */
export function temaDe(texto, p = {}) {
  const t = String(texto || '').toLowerCase(), nombre = nombreSuelto(p);
  if (/puente|\bpaso\b|libre|salida|cruzar|ruta|callej/.test(t)) return 'paso';
  if (/agua|nivel|calle|cuadra|crecida|corriente|\br[ií]o\b|inund|moj/.test(t)) return 'agua';
  if ((nombre && t.includes(nombre)) || /silla|ruedas|niñ|chic|abuel|señora|señor|doña|\bdon\b|con ustedes|contigo|consigo|entendi|señas|quechua|guaraní|aimara|cómo está|como esta/.test(t)) return 'persona';
  if (/alt[oa]|loma|zona|segur|resguard|refugio|escuela|plaza|arriba|subi|lleg/.test(t)) return 'alto';
  return 'general';
}

// ---------- sugerencias de la central ----------
// antes de que el ayudante avise que va en camino
const SUGERENCIAS_CAMINO = [
  () => '¿Ya vas en camino?', () => '¿Ya saliste para allá?', p => `¿Cuánto te falta para llegar donde ${p.nombre}?`,
  () => 'Avísame apenas llegues.', () => '¿Ya sabes por dónde entrar a la cuadra?',
];
// cuando ya va en camino: por tema, para ofrecer dos preguntas distintas entre sí
const SUGERENCIAS = {
  agua: [() => '¿Cómo está el nivel del agua en la cuadra?', () => '¿Cómo está la calle por ahí? Avísame cuando estén a salvo.',
    () => '¿Hasta dónde llega el agua donde están?', () => '¿Necesitan apoyo o ya están fuera del agua?'],
  alto: [() => '¿Ya lograron llegar a zona alta?', () => '¿Ya subieron al punto alto?', () => 'Avísame en cuanto lleguen a lugar seguro.',
    () => 'Reporta en cuanto estén resguardados.'],
  persona: [p => `¿Ya tienen a ${p.nombre} con ustedes?`, p => `¿Cómo está ${p.nombre}?`, p => `¿Ya tienen a ${p.nombre} en lugar seguro?`],
  paso: [() => '¿El paso sigue libre para salir?', () => '¿Pudieron cruzar o el puente ya está tapado?', () => '¿Tienen salida por la calle de arriba?'],
  general: [() => 'Confírmame por favor si ya están fuera de peligro.', () => 'Avísame cuando estén a salvo.'],
};
// preguntas sobre la asistencia concreta de esa persona
const SUGERENCIAS_ASISTENCIA = {
  silla: [() => '¿Pudieron mover la silla de ruedas?'],
  sordo: [p => `¿${p.nombre} entendió el aviso?`],
  grupo: [() => '¿Los chicos están con ustedes?'],
  idioma: [p => `¿Pudieron explicarle a ${p.nombre} en ${idiomaDe(p)}?`],
  general: [],
};

/**
 * Elige `cuantas` sugerencias (por defecto 2) para el paso del ayudante (0 antes de «en camino», 1 en camino), sin repetir
 * tema. Cada una lleva su tema (calculado con temaDe, así coincide con lo que se responde a un texto escrito igual).
 * @returns {{texto:string, tema:string}[]}
 */
export function elegirSugerencias(p, paso, azar = Math.random, cuantas = 2) {
  const con = f => { const texto = f(p); return { texto, tema: temaDe(texto, p) }; };
  if (!paso) {
    const banco = SUGERENCIAS_CAMINO.map(con), out = [];
    while (out.length < cuantas && banco.length) out.push(banco.splice(Math.floor(azar() * banco.length) % banco.length, 1)[0]);
    return out;
  }
  const porTema = Object.fromEntries(Object.entries(SUGERENCIAS).map(([k, l]) => [k, l.map(con)]));
  porTema.persona.push(...SUGERENCIAS_ASISTENCIA[tipoAsistencia(p)].map(con));
  const temas = Object.keys(porTema), out = [];
  while (out.length < cuantas && temas.length) {
    const tema = temas.splice(Math.floor(azar() * temas.length) % temas.length, 1)[0];
    const opciones = porTema[tema].filter(s => s.tema === tema && !out.some(o => o.texto === s.texto));
    if (opciones.length) out.push(elegir(opciones, azar));
  }
  return out;
}

// ---------- respuesta del ayudante: confirma que están a salvo, hablando de lo que se le preguntó ----------
const RESPUESTAS = {
  agua: [p => `La calle ya es un río, el agua pasa la rodilla. Pero ya salimos con ${p.nombre} y estamos a salvo en lo alto.`,
    () => 'El nivel subió como medio metro en minutos; alcanzamos a salir. Ya estamos fuera del agua.',
    () => 'En la cuadra el agua corre fuerte y arrastra ramas. Nosotros ya estamos a salvo, lejos de la orilla.'],
  alto: [p => `¡Sí! Ya llegamos al punto alto con ${p.nombre}. Desde aquí se ve cómo el río tapa la calle.`,
    () => 'Ya estamos arriba, en la loma. Abajo el agua sigue subiendo, pero aquí estamos a salvo.',
    () => 'Llegamos a la escuela, que es zona alta. Estamos resguardados, el agua no llega hasta acá.'],
  paso: [() => 'El puente de la esquina ya está tapado; salimos por la calle de arriba. Ya estamos a salvo.',
    p => `El paso de abajo se cortó, pero subimos por el callejón con ${p.nombre}. Ya estamos en lugar seguro.`,
    () => 'La salida principal ya no sirve, el agua la tapó; dimos la vuelta por la cancha y ya estamos a salvo.'],
  general: [() => '¡Listo! Ya estamos a salvo en la loma, el agua ya tapó la calle.',
    p => `¡Ya está! Sacamos a ${p.nombre} justo a tiempo, estamos en punto alto.`,
    () => '¡A salvo! Llegamos a la plaza; atrás el río ya se llevó la vereda.',
    p => `¡Lo logramos! ${p.nombre} ya está con nosotros en la escuela, el agua sigue subiendo.`],
};
const RESPUESTAS_PERSONA = {
  silla: p => `Sí, tengo a ${p.nombre} conmigo. Subimos la silla de ruedas entre dos vecinos; ya estamos a salvo.`,
  sordo: p => `${p.nombre} está conmigo; le avisé con señas y entendió todo. Ya estamos a salvo en lo alto.`,
  grupo: p => /^Familia\s/i.test(p.nombre) ? 'Tengo a toda la familia conmigo, asustados pero bien. Ya estamos a salvo en la escuela.'
    : cuantosDe(p) ? `Los tengo a los ${cuantosDe(p)} conmigo, asustados pero bien. Ya estamos a salvo en la escuela.`
      : 'Los tengo a todos conmigo, asustados pero bien. Ya estamos a salvo en la escuela.',
  idioma: p => `${p.nombre} está conmigo; le expliqué en ${idiomaDe(p)} y entendió todo. Ya estamos a salvo.`,
  general: p => `${p.nombre} está conmigo y está bien. Ya estamos a salvo, fuera del agua.`,
};
/** La confirmación del ayudante (ya están a salvo), coherente con el tema de lo que preguntó la central. */
export function respuestaConfirmacion(p, tema = 'general', azar = Math.random) {
  if (tema === 'persona') return RESPUESTAS_PERSONA[tipoAsistencia(p)](p);
  return elegir(RESPUESTAS[tema] || RESPUESTAS.general, azar)(p);
}
