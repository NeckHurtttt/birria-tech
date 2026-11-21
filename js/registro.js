// Registro de personas que no pueden evacuar solas y de su vecino guardián.
// Se guarda en este navegador (prototipo); en producción va a la base de la junta vecinal.
// Una persona nueva queda «pendiente» hasta que la junta la aprueba: recién ahí entra en las alertas.
import { PERSONAS } from './datos.js';

const CLAVE = 'rs-registro-v1';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; } };
const escribir = l => { try { localStorage.setItem(CLAVE, JSON.stringify(l)); } catch {} };

/** Todas las personas: las del simulacro (ficticias) + las registradas aquí. */
export const todas = () => [...PERSONAS.map(p => ({ ...p, aprobado: true, demo: true })), ...leer()];
/** Solo las aprobadas por la junta: son las que reciben la alerta. */
export const activas = () => todas().filter(p => p.aprobado);

export function registrar(d) {
  const l = leer();
  const id = 'r' + Date.now().toString(36);
  l.push({ id, nombre: d.nombre.trim(), edad: Number(d.edad) || '', necesidad: d.necesidad.trim(), barrio: d.barrio,
    cuadra: d.cuadra.trim(), guardian: d.guardian.trim(), tel: limpiarTel(d.tel), idioma: d.idioma, aprobado: false, alta: new Date().toISOString() });
  escribir(l); return id;
}
export function aprobar(id) { const l = leer(); const p = l.find(x => x.id === id); if (p) { p.aprobado = true; escribir(l); } }
export function quitar(id) { escribir(leer().filter(x => x.id !== id)); }

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
