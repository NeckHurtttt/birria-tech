#!/usr/bin/env python3
"""Lee el último boletín hidrológico de SENAMHI para Santa Cruz y guarda el pronóstico del Piraí.

SENAMHI no tiene API: publica un PDF cada día hábil en
https://senamhi.gob.bo/meteorologia/boletines/pronostico_hidrologico/<año>/<MES>/SC-BOLETÍN ... dd-mm-aaaa.pdf
Este script busca el más nuevo, lo pasa a texto con pdftotext (poppler) y escribe datos/senamhi.json
con la amenaza oficial por tramo (alta, media, baja) para los próximos 14 días.

  python3 herramientas/senamhi.py              # descarga el último boletín
  python3 herramientas/senamhi.py boletin.pdf  # usa un PDF local (pruebas)
Lo corre la GitHub Action .github/workflows/senamhi.yml cada día hábil.
"""
import json, re, subprocess, sys, tempfile, urllib.parse, urllib.request
from datetime import date, datetime, timezone
from pathlib import Path

BASE = 'https://senamhi.gob.bo/meteorologia/boletines/pronostico_hidrologico'
MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO',
         'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']
SALIDA = Path(__file__).resolve().parent.parent / 'datos' / 'senamhi.json'
AMENAZA = re.compile(r'Sin amenaza|Amarilla|Naranja|Roja', re.I)
TENDENCIA = re.compile(r'Ascensos|Descensos|Poco variable', re.I)
FECHA = re.compile(r'\b(\d{2})-(\d{2})-(\d{2})\b')
CODIGO = {'sin amenaza': 'sin', 'amarilla': 'amarilla', 'naranja': 'naranja', 'roja': 'roja'}


def bajar(url, tiempo=60):
    req = urllib.request.Request(url, headers={'User-Agent': 'el-rio-suena/1.0 (alerta comunitaria)'})
    with urllib.request.urlopen(req, timeout=tiempo) as r:
        return r.read()


def ultimo_boletin(hoy=None):
    """URL y fecha del SC-BOLETÍN más nuevo (mes actual o el anterior)."""
    hoy = hoy or date.today()
    meses = [(hoy.year, hoy.month), (hoy.year - (hoy.month == 1), 12 if hoy.month == 1 else hoy.month - 1)]
    for anio, mes in meses:
        carpeta = f'{BASE}/{anio}/{MESES[mes - 1]}/'
        try:
            html = bajar(carpeta, 30).decode('utf-8', 'replace')
        except Exception:
            continue
        cands = []
        for href in re.findall(r'href="([^"]+\.pdf)"', html, re.I):
            nombre = urllib.parse.unquote(href)
            m = re.search(r'(\d{2})-(\d{2})-(\d{4})', nombre)
            if nombre.startswith('SC-BOLET') and m:
                cands.append((date(int(m[3]), int(m[2]), int(m[1])), carpeta + href))
        if cands:
            f, url = max(cands)
            return url, f
    raise SystemExit('no se encontró ningún boletín SC de SENAMHI')


def texto_pdf(ruta):
    return subprocess.run(['pdftotext', '-layout', str(ruta), '-'], check=True, capture_output=True, text=True).stdout


def fecha_iso(m):
    return f'20{m[2]}-{m[1]}-{m[0]}'


def leer_pirai(texto):
    """Extrae del texto del boletín la sección de la cuenca del Piraí."""
    ini = texto.find('CUENCA DEL RÍO PIRAÍ')
    if ini < 0:
        raise ValueError('el boletín no tiene la sección del Piraí')
    fin = texto.find('CUENCA DEL RÍO', ini + 10)
    sec = texto[ini:fin if fin > 0 else None]
    lineas = sec.splitlines()

    resumen = ''
    for i, l in enumerate(lineas):
        if 'Resumen del Pronóstico' in l:
            partes = []
            for x in lineas[i + 1:i + 9]:
                x = x.strip()
                if not x or 'Significado' in x:
                    if partes: break
                    continue
                if x.lower() in CODIGO or x == 'Naranja':
                    continue
                partes.append(x)
            resumen = ' '.join(partes)
            break

    estacion = None
    m = re.search(r'Piraí\s+(Puente San Luis|[A-ZÁÉÍÓÚ][\w ]+?)\s{2,}(\S+)\s+([\d.,]+)', sec)
    if m:
        estacion = {'nombre': m[1].strip(), 'nivel_m': float(m[3].replace(',', '.')),
                    'alerta_roja_m': None if m[2] == '-' else float(m[2].replace(',', '.'))}

    tramos = {}
    cortes = [(k, sec.find(t)) for k, t in (('alta', 'Cuenca Alta'), ('media', 'Cuenca Media'), ('baja', 'Cuenca Baja'))]
    cortes = [(k, p) for k, p in cortes if p >= 0]
    for j, (k, p) in enumerate(cortes):
        bloque = sec[p:cortes[j + 1][1] if j + 1 < len(cortes) else None].splitlines()
        dias = []
        idx_fechas = [i for i, l in enumerate(bloque) if len(FECHA.findall(l)) >= 5]
        for n, i in enumerate(idx_fechas):
            hasta = idx_fechas[n + 1] if n + 1 < len(idx_fechas) else len(bloque)
            fechas = [fecha_iso(f) for f in FECHA.findall(bloque[i])]
            am = next((AMENAZA.findall(l) for l in bloque[i + 1:hasta] if len(AMENAZA.findall(l)) >= 5), [])
            te = next((TENDENCIA.findall(l) for l in bloque[i + 1:hasta] if len(TENDENCIA.findall(l)) >= 5), [])
            for d, f in enumerate(fechas):
                dias.append({'fecha': f,
                             'amenaza': CODIGO.get(am[d].lower()) if d < len(am) else None,
                             'tendencia': te[d].lower() if d < len(te) else None})
        tramos[k] = dias
    if not any(tramos.values()):
        raise ValueError('no se pudo leer la tabla de 14 días del Piraí')
    return {'resumen': resumen, 'estacion': estacion, 'tramos': tramos}


def main():
    if len(sys.argv) > 1:
        ruta, url = Path(sys.argv[1]), None
        m = re.search(r'(\d{2})-(\d{2})-(\d{4})', ruta.name)
        fecha = date(int(m[3]), int(m[2]), int(m[1])) if m else None
    else:
        url, fecha = ultimo_boletin()
        tmp = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
        tmp.write(bajar(url)); tmp.close()
        ruta = Path(tmp.name)
    datos = leer_pirai(texto_pdf(ruta))
    if not fecha:
        dias = datos['tramos'].get('alta') or next(v for v in datos['tramos'].values() if v)
        fecha = date.fromisoformat(dias[0]['fecha'])
    salida = {'fuente': 'SENAMHI · Boletín de pronóstico hidrológico Santa Cruz (OMM-GloFAS)',
              'boletin': fecha.isoformat(), 'url': url,
              'leido_en': datetime.now(timezone.utc).isoformat(timespec='seconds'), **datos}
    viejo = json.loads(SALIDA.read_text()) if SALIDA.exists() else {}
    if {k: v for k, v in viejo.items() if k != 'leido_en'} == {k: v for k, v in salida.items() if k != 'leido_en'}:
        print('sin cambios:', fecha); return
    SALIDA.parent.mkdir(exist_ok=True)
    SALIDA.write_text(json.dumps(salida, ensure_ascii=False, indent=1) + '\n')
    hoy = next((d for d in datos['tramos'].get('alta', []) if d['fecha'] == date.today().isoformat()), None)
    print(f'boletín {fecha} · {datos["resumen"][:60]} · hoy (alta): {hoy}')


if __name__ == '__main__':
    main()
