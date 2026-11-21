#!/usr/bin/env python3
"""Validación de El Río Suena con datos abiertos reales (Open-Meteo). Uso: python3 herramientas/validar.py
1) Riada del 13/12/2025 en El Torno: ¿qué lluvia vieron los modelos en la cuenca alta? → regenera js/historico.js
2) 42 años de caudal GloFAS en La Angostura: percentiles y crecidas más grandes del modelo.
No necesita claves. Solo usa la biblioteca estándar."""
import json, urllib.request, pathlib
RAIZ = pathlib.Path(__file__).resolve().parent.parent
CUENCA = [(-18.16, -63.62), (-18.18, -63.70), (-18.18, -63.87), (-18.30, -63.78), (-18.10, -63.78)]
ANG = (-18.1727, -63.5405)
lat = ','.join(str(a) for a, _ in CUENCA); lon = ','.join(str(b) for _, b in CUENCA)
get = lambda u: json.load(urllib.request.urlopen(u, timeout=120))

print('1) Riada 12–13/12/2025, lluvia horaria de los modelos (peor de 5 puntos):')
R = {}
for m in ['best_match', 'ecmwf_ifs025', 'icon_seamless', 'gfs_seamless']:
    G = get(f'https://historical-forecast-api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&start_date=2025-12-11&end_date=2025-12-13&hourly=precipitation&models={m}&timezone=America%2FLa_Paz')
    t = G[0]['hourly']['time']; a, b = t.index('2025-12-12T06:00'), t.index('2025-12-13T07:00')
    R[m] = [round(max((g['hourly']['precipitation'][i] or 0) for g in G), 1) for i in range(a, b)]
    print(f'   {m:15} total {sum(R[m]):5.1f} mm · máx {max(R[m])} mm/h')
Q = get(f'https://flood-api.open-meteo.com/v1/flood?latitude={ANG[0]}&longitude={ANG[1]}&daily=river_discharge&start_date=1984-01-01&end_date=2026-10-31')['daily']
QD = dict(zip(Q['time'], Q['river_discharge']))
caudal = {d: QD[d] for d in ['2025-12-11', '2025-12-12', '2025-12-13', '2025-12-14']}
print('   caudal GloFAS La Angostura:', caudal)

js = RAIZ / 'js' / 'historico.js'
txt = js.read_text()
inicio = txt.index('lluviaHora:'); fin = txt.index('\n', inicio)
txt = txt[:inicio] + f'lluviaHora: {json.dumps(R["best_match"])},' + txt[fin:]
inicio = txt.index('caudalDia:'); fin = txt.index('\n', inicio)
txt = txt[:inicio] + f'caudalDia: {json.dumps(caudal)},' + txt[fin:]
js.write_text(txt); print('   js/historico.js actualizado')

v = sorted(x for x in Q['river_discharge'] if x is not None); n = len(v)
print(f'2) GloFAS 1984–2026 ({n} días): mediana {v[n//2]} · p95 {v[int(n*.95)]} · p99 {v[int(n*.99)]} · máx {v[-1]} m³/s')
print('   La riada más letal en 42 años no se ve en GloFAS (promedio diario de un modelo global):')
print('   por eso El Río Suena suma vigías río arriba, reglas pintadas y el oído del río.')
