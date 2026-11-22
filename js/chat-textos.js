// Textos del chat con el vecino ayudante durante el simulacro: sugerencias de la central, de qué trata cada mensaje
// y lo que dice el ayudante. Todo depende de la ZONA del caso según el avance de la crecida:
//   'lejos' → todavía hay bastante margen hasta que llegue el agua: tono tranquilo y preventivo (nunca agua desbordando);
//   'cerca' → queda poco o el agua ya llegó: tono de emergencia.
// Sin DOM: se prueba en pruebas.mjs.

/** Más de esto (minutos hasta que llega el agua al barrio) = zona 'lejos'. Con más de 1 h de margen el ayudante todavía no
 * puede decir que el agua tapa la calle. */
export const MARGEN_LEJOS_MIN = 60;
export const zonaPorMinutos = min => (min > MARGEN_LEJOS_MIN ? 'lejos' : 'cerca');

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
// «resguardado/a/os» según la persona: Doña → a, Don → o, grupos → os
const terminacion = p => /^Doña\s/i.test(p.nombre) ? 'a' : /^(Niños|Familia)\s/i.test(p.nombre) ? 'os' : 'o';
// nombre sin «Doña/Don/Niños/Familia» ni «(3)», para reconocerlo en lo que escribe la central
const nombreSuelto = p => String(p.nombre || '').toLowerCase().replace(/^(doña|don|niños|familia)\s+/, '').replace(/\s*\(\d+\)\s*$/, '').trim();

/**
 * De qué trata un mensaje de la central: 'paso' (salida/puente/ruta), 'preventivo' (salir antes), 'preparar' (alistar cosas),
 * 'animo' (ánimo/organización), 'agua' (calle/nivel), 'persona' (la persona asistida), 'alto' (zona alta/lugar seguro)
 * o 'general'. Sirve para respuestas rápidas y para texto escrito a mano.
 */
export function temaDe(texto, p = {}) {
  const t = String(texto || '').toLowerCase(), nombre = nombreSuelto(p);
  if (/puente|\bpaso\b|libre|salida|cruzar|ruta|callej|despejad/.test(t)) return 'paso';
  if (/preventiv|adelant|con tiempo|antes de que/.test(t)) return 'preventivo';
  if (/\balist|\bcosas\b|mochila|document|medicin|prepar|\blistos\b/.test(t)) return 'preparar'; // \b: «saliste» no es «alistar»
  if (/ánimo|animo|organiza|cómo están los vecinos|como estan los vecinos/.test(t)) return 'animo';
  if (/agua|nivel|calle|cuadra|crecida|corriente|\br[ií]o\b|inund|moj/.test(t)) return 'agua';
  if ((nombre && t.includes(nombre)) || /silla|ruedas|niñ|chic|abuel|señora|señor|doña|\bdon\b|con ustedes|contigo|consigo|entendi|señas|quechua|guaraní|aimara|cómo está|como esta/.test(t)) return 'persona';
  if (/alt[oa]|loma|zona|segur|resguard|refugio|escuela|plaza|arriba|subi|lleg|ubicad/.test(t)) return 'alto';
  return 'general';
}

// ---------- lo que dice el ayudante al salir (paso 1, solo, al saltar la alerta) ----------
const EN_CAMINO = {
  cerca: [p => `¡Ya voy por ${p.nombre}! El agua ya está cubriendo la calle.`,
    p => `¡Voy corriendo a buscar a ${p.nombre}, el río está bramando!`,
    p => `¡En camino por ${p.nombre}! La corriente ya pasa por la esquina.`,
    p => `¡Ya salgo por ${p.nombre}! El río suena cada vez más fuerte.`],
  lejos: [p => `Todavía tenemos buen margen antes de que llegue la crecida; ya voy por ${p.nombre} para movernos con calma.`,
    () => 'Por aquí aún no llega el agua, estamos organizando todo con tiempo para salir sin apuros.',
    () => 'Ya salimos de manera preventiva hacia zona segura; todavía falta tiempo aquí pero preferimos adelantarnos.',
    p => `Todo tranquilo por esta zona de momento, ya estoy acompañando a ${p.nombre} para dejarl${terminacion(p)} bien resguardad${terminacion(p)}.`,
    p => `Recibido, central. Voy donde ${p.nombre} con tiempo; por aquí el río todavía está lejos.`],
};
export const mensajeEnCamino = (p, zona = 'cerca', azar = Math.random) => elegir(EN_CAMINO[zona] || EN_CAMINO.cerca, azar)(p);

// ---------- sugerencias de la central ----------
// antes de que el ayudante avise que va en camino
const SUGERENCIAS_CAMINO = {
  cerca: [() => '¿Ya vas en camino?', () => '¿Ya saliste para allá?', p => `¿Cuánto te falta para llegar donde ${p.nombre}?`,
    () => 'Avísame apenas llegues.', () => '¿Ya sabes por dónde entrar a la cuadra?'],
  lejos: [() => '¿Ya recibiste el aviso? Hay margen, pero conviene salir con tiempo.', p => `¿Puedes ir con calma donde ${p.nombre}?`,
    () => '¿Ya vas en camino?', () => 'Avísame apenas llegues.'],
};
// cuando ya va en camino: por tema, para ofrecer dos preguntas distintas entre sí
const SUGERENCIAS = {
  cerca: {
    agua: [() => '¿Cómo está el nivel del agua en esa cuadra?', () => '¿Cómo está la calle por ahí? Avísame cuando estén a salvo.',
      () => '¿Hasta dónde llega el agua donde están?', () => '¿Necesitan apoyo o ya están fuera del agua?'],
    alto: [() => '¿Ya lograron subir a zona alta?', () => '¿Ya subieron al punto alto?', () => 'Avísame en cuanto lleguen a lugar seguro.',
      () => 'Reporta en cuanto estén resguardados.'],
    persona: [p => `¿Ya tienen a ${p.nombre} resguardad${terminacion(p)}?`, p => `¿Ya tienen a ${p.nombre} con ustedes?`, p => `¿Cómo está ${p.nombre}?`],
    paso: [() => '¿El paso sigue libre para salir?', () => '¿Pudieron cruzar o el puente ya está tapado?', () => '¿Tienen salida por la calle de arriba?'],
    general: [() => 'Confírmame en cuanto estén fuera de peligro.', () => 'Confírmame por favor si ya están fuera de peligro.', () => 'Avísame cuando estén a salvo.'],
  },
  lejos: {
    preparar: [() => '¿Ya están alistando sus cosas con calma?', () => '¿Ya tienen listos documentos y medicinas?'],
    preventivo: [() => '¿Van a salir de manera preventiva antes de que baje el agua?', () => '¿Prefieren adelantarse y salir con tiempo?'],
    animo: [() => '¿Cómo está el ánimo y la organización por allá?', () => '¿Cómo están los vecinos por allá, tranquilos?'],
    alto: [() => 'Avísame cuando ya estén ubicados en un lugar seguro.', () => '¿Ya saben a qué lugar seguro van a ir?'],
    agua: [() => '¿Por allá ya se ve subir el río?'],
    persona: [p => `¿${p.nombre} ya sabe${terminacion(p) === 'os' ? 'n' : ''} que van a salir?`, p => `¿Cómo está ${p.nombre}?`],
    paso: [() => '¿La ruta de evacuación sigue despejada?'],
  },
};
// preguntas sobre la asistencia concreta de esa persona (sirven en las dos zonas)
const SUGERENCIAS_ASISTENCIA = {
  silla: [() => '¿Pudieron mover la silla de ruedas?'],
  sordo: [p => `¿${p.nombre} entendió el aviso?`],
  grupo: [() => '¿Los chicos están con ustedes?'],
  idioma: [p => `¿Pudieron explicarle a ${p.nombre} en ${idiomaDe(p)}?`],
  general: [],
};

/**
 * Elige `cuantas` sugerencias (por defecto 2) para el paso del ayudante (0 antes de «en camino», 1 en camino) y la zona,
 * sin repetir tema. Cada una lleva su tema (calculado con temaDe: coincide con lo que se responde a un texto escrito igual).
 * @returns {{texto:string, tema:string}[]}
 */
export function elegirSugerencias(p, paso, azar = Math.random, cuantas = 2, zona = 'cerca') {
  const z = SUGERENCIAS[zona] ? zona : 'cerca', con = f => { const texto = f(p); return { texto, tema: temaDe(texto, p) }; };
  if (!paso) {
    const banco = SUGERENCIAS_CAMINO[z].map(con), out = [];
    while (out.length < cuantas && banco.length) out.push(banco.splice(Math.floor(azar() * banco.length) % banco.length, 1)[0]);
    return out;
  }
  const porTema = Object.fromEntries(Object.entries(SUGERENCIAS[z]).map(([k, l]) => [k, l.map(con)]));
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
  cerca: {
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
  },
  lejos: {
    preparar: [() => 'Sí, ya tenemos documentos, medicinas y una mochila con lo necesario. Salimos con calma y ya estamos en lugar seguro.',
      () => 'Alistamos lo importante sin apuro y ya nos movimos; estamos ubicados en zona segura.'],
    preventivo: [() => 'Sí, salimos de manera preventiva; todavía falta para que llegue el agua, pero ya estamos en zona segura.',
      p => `Preferimos adelantarnos: ya estamos con ${p.nombre} en la escuela, con tiempo de sobra.`],
    animo: [() => 'El ánimo está bien, los vecinos se organizaron rápido. Ya estamos todos ubicados en lugar seguro.',
      () => 'Todo ordenado por aquí: la gente salió tranquila y ya estamos en el punto de encuentro, a salvo.'],
    alto: [p => `Ya estamos ubicados en la escuela con ${p.nombre}, con tiempo de sobra; aquí todavía no llega el agua.`,
      () => 'Ya llegamos al punto de encuentro, en zona alta. Todo tranquilo, quedamos atentos.'],
    agua: [() => 'Por aquí el agua todavía no llega; el río se ve crecido a lo lejos. Ya estamos en zona segura por precaución.',
      () => 'Todavía no sube por esta zona, pero no quisimos esperar: ya estamos a salvo en lo alto.'],
    paso: [() => 'Las calles siguen libres; salimos sin problema por la ruta de evacuación y ya estamos a salvo.'],
    general: [() => 'Listo, ya estamos en lugar seguro, con calma; aquí todavía hay margen.',
      p => `Ya estamos con ${p.nombre} en la escuela, todo en orden; por aquí sigue tranquilo.`],
  },
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
/** La confirmación del ayudante (ya están a salvo), coherente con el tema preguntado y con la zona. */
export function respuestaConfirmacion(p, tema = 'general', azar = Math.random, zona = 'cerca') {
  if (tema === 'persona') return RESPUESTAS_PERSONA[tipoAsistencia(p)](p);
  const z = RESPUESTAS[zona] || RESPUESTAS.cerca;
  return elegir(z[tema] || z.general, azar)(p);
}

// ---------- apuro: el ayudante insiste si la central tarda en entrar a su chat ----------
// 'camino' pide respuesta (sin decir que ya están a salvo); 'listo' pide que confirmen la evacuación.
export const APUROS = {
  cerca: {
    camino: [p => `¡Central, respondan! Ya llegué donde ${p.nombre}, el agua nos llega a los tobillos.`,
      () => '¿Me copian? El río sigue creciendo, necesito que me respondan.',
      p => `¡Sigo con ${p.nombre} y la señal se corta! Escríbanme por favor.`,
      () => '¡Central! Aquí el agua sube rápido, ¿me escuchan?'],
    listo: [p => `¡Central, por favor confirmen recibido! Ya estamos en punto alto con ${p.nombre}.`,
      () => '¿Me copian en la central? Ya salimos de la zona baja, espero confirmación.',
      p => `¡Sigo esperando que confirmen la evacuación de ${p.nombre}, la señal está inestable!`,
      () => '¡Por favor respondan! Necesito saber si ya nos registraron como evacuados.'],
  },
  lejos: {
    camino: [() => 'Central, ¿me copian? Todo tranquilo por aquí, solo espero indicaciones.',
      p => `Ya estoy con ${p.nombre}. Hay tiempo, pero me gustaría saber si salimos ya.`,
      () => '¿Siguen ahí, central? Por esta zona el agua aún no llega, quedo atento.'],
    listo: [() => 'Central, ¿me confirman recibido? Ya estamos ubicados, sin apuro, pero quiero dejarlo registrado.',
      p => `Seguimos en el lugar seguro con ${p.nombre}. Cuando puedan, confirmen la evacuación.`,
      () => '¿Nos registraron como evacuados? Aquí todo en orden, solo falta su confirmación.'],
  },
};
