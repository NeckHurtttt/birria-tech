// Registro de personas que no pueden evacuar solas y de su vecino guardián.
// Se guarda al instante en este celular y se sube al registro compartido de la junta (Supabase) cuando hay internet.
// Una persona nueva queda «pendiente» hasta que la junta la aprueba: recién ahí entra en las alertas.
import { PERSONAS } from './datos.js';
import { nube, hayNube } from './nube.js';

const CLAVE = 'rs-registro-v1';        // altas hechas en este celular (con o sin internet)
const CLAVE_NUBE = 'rs-registro-nube';   // copia de lo que la junta ve en Supabase (para seguir sin internet)
const leerDe = k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const escribirEn = (k, l) => { try { localStorage.setItem(k, JSON.stringify(l)); } catch {} };
const leer = () => leerDe(CLAVE), escribir = l => escribirEn(CLAVE, l);
const leerNube = () => leerDe(CLAVE_NUBE);
const nuevoId = () => (crypto.randomUUID?.() || 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8));

/** Todas las personas: las del simulacro (ficticias) + las de la nube + las de este celular que aún no están en la nube. */
export const todas = () => {
  const remotas = leerNube(), ids = new Set(remotas.map(p => p.id));
  return [...PERSONAS.map(p => ({ ...p, aprobado: true, demo: true })), ...remotas.map(p => ({ ...p, nube: true })), ...leer().filter(p => !ids.has(p.id))];
};
/** Solo las aprobadas por la junta: son las que reciben la alerta. */
export const activas = () => todas().filter(p => p.aprobado);

/** Guarda aquí al instante y lo sube a la nube en segundo plano. Devuelve {id, subida: Promise<boolean>}. */
export function registrar(d) {
  const l = leer(), id = nuevoId();
  const p = { id, nombre: d.nombre.trim(), edad: Number(d.edad) || '', necesidad: d.necesidad.trim(), barrio: d.barrio,
    cuadra: d.cuadra.trim(), guardian: d.guardian.trim(), tel: limpiarTel(d.tel), idioma: d.idioma, aprobado: false, alta: new Date().toISOString(), subido: false };
  l.push(p); escribir(l);
  return { id, subida: subir(p) };
}
async function subir(p) {
  if (!hayNube() || !/^[0-9a-f-]{36}$/.test(p.id)) return false;
  try {
    await nube.registrar({ ...p, edad: p.edad === '' ? null : p.edad, tel: p.tel || null });
    const l = leer(), x = l.find(q => q.id === p.id); if (x) { x.subido = true; escribir(l); }
    return true;
  } catch { return false; }
}
/** Reintenta lo que se registró sin internet. */
export const subirPendientes = () => Promise.all(leer().filter(p => !p.subido && !p.aprobado).map(subir));

/** Trae la lista de la junta (pide la clave). Lanza error si la clave está mal. */
export async function sincronizar(clave) {
  const l = await nube.listar(clave);
  escribirEn(CLAVE_NUBE, l.map(p => ({ id: p.id, nombre: p.nombre, edad: p.edad ?? '', necesidad: p.necesidad, barrio: p.barrio, cuadra: p.cuadra, guardian: p.guardian, tel: p.tel || '', idioma: p.idioma, aprobado: p.aprobado, alta: p.alta })));
  const ids = new Set(l.map(p => p.id));
  escribir(leer().filter(p => !ids.has(p.id) && !p.subido)); // lo ya subido vive en la nube
  return l.length;
}
export const enNube = id => leerNube().some(p => p.id === id);

export async function aprobar(id, clave) {
  if (enNube(id)) { await nube.aprobar(clave, id); await sincronizar(clave); return; }
  const l = leer(); const p = l.find(x => x.id === id); if (p) { p.aprobado = true; escribir(l); }
}
export async function quitar(id, clave) {
  if (enNube(id)) { await nube.quitar(clave, id); await sincronizar(clave); return; }
  escribir(leer().filter(x => x.id !== id));
}

/** Deja solo dígitos y un + inicial; agrega +591 a un celular boliviano de 8 dígitos. */
export function limpiarTel(t = '') {
  const s = String(t).replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  return /^[67]\d{7}$/.test(s) ? '+591' + s : s;
}

const ETIQUETA = { tranquilo: 'sin alerta', avisado: 'avisado, sin confirmar', salvo: 'a salvo', rescate: 'al rescate oficial' };
/** CSV para la junta / el COED (separado por ; para que Excel en español lo abra bien). */
export function aCSV(lista, estados, barrioDe) {
  const c = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const filas = [['Persona', 'Edad', 'Necesidad', 'Barrio', 'Cuadra', 'Guardián', 'Teléfono guardián', 'Idioma', 'Aprobado', 'Estado']];
  lista.forEach(p => filas.push([p.nombre, p.edad, p.necesidad, barrioDe(p.barrio), p.cuadra, p.guardian, p.tel || '', p.idioma, p.aprobado ? 'sí' : 'pendiente', ETIQUETA[estados[p.id]] || 'sin alerta']));
  return '﻿' + filas.map(f => f.map(c).join(';')).join('\r\n');
}
