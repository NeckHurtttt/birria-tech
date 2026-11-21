"""Vigía por Telegram para El Río Suena.

El vigía río arriba manda un AUDIO (o un texto) a un bot de Telegram:
  «el río está creciendo, ya tapa la piedra grande»
Whisper lo transcribe en esta PC, se decide si es un reporte de crecida y, si lo es, se publica en el
canal de la central (ntfy propio + ntfy.sh de respaldo) con el mismo formato que vigia.html.
La central lo cuenta como vigía: con 2 vigías distintos se lanza la alerta.

Seguridad: solo cuentan los vigías dados de alta por la junta (vigias.json).
Alta desde Telegram:  /alta <clave de la junta> <puesto>   (puestos: bermejo, espejos, samaipata, angostura)

Configuración por variables de entorno (ver nodo/.env.ejemplo). Uso: python vigia_bot.py
"""
import json, os, pathlib, random, string, sys, tempfile, time, urllib.parse, urllib.request
from clasificar import clasificar

CFG = {
    'token': os.environ.get('TELEGRAM_TOKEN', ''),
    'tema': os.environ.get('TEMA', ''),
    'ntfy': [u.strip().rstrip('/') + '/' for u in os.environ.get('NTFY_URLS', 'https://ntfy.sh').split(',') if u.strip()],
    'vigias': pathlib.Path(os.environ.get('VIGIAS_ARCHIVO', 'vigias.json')),
    'clave': os.environ.get('JUNTA_CLAVE', ''),
    'whisper': os.environ.get('WHISPER_MODELO', 'small'),
    'ollama': os.environ.get('OLLAMA_URL', ''),
    'ollama_modelo': os.environ.get('OLLAMA_MODELO', 'qwen2.5:3b'),
}
PUESTOS = {'bermejo': 'Bermejo', 'espejos': 'río Espejos', 'samaipata': 'Samaipata', 'angostura': 'La Angostura'}
API = f"https://api.telegram.org/bot{CFG['token']}/"
ARCH = f"https://api.telegram.org/file/bot{CFG['token']}/"

def log(*a):
    print(time.strftime('%H:%M:%S'), *a, flush=True)

# ---------- Telegram (HTTP simple, long polling) ----------
def tg(metodo, **params):
    datos = urllib.parse.urlencode(params).encode()
    with urllib.request.urlopen(API + metodo, data=datos, timeout=70) as r:
        d = json.loads(r.read())
    if not d.get('ok'):
        raise RuntimeError(d)
    return d['result']

def responder(chat, texto):
    try:
        tg('sendMessage', chat_id=chat, text=texto)
    except Exception as e:
        log('no se pudo responder:', e)

def bajar_audio(file_id) -> str:
    ruta = tg('getFile', file_id=file_id)['file_path']
    destino = os.path.join(tempfile.gettempdir(), 'rs-' + file_id[-12:] + pathlib.Path(ruta).suffix)
    urllib.request.urlretrieve(ARCH + ruta, destino)
    return destino

# ---------- Whisper (se carga una sola vez, la primera vez que llega un audio) ----------
_modelo = None
def transcribir(archivo) -> str:
    global _modelo
    if _modelo is None:
        from faster_whisper import WhisperModel  # import tardío: el bot arranca aunque falte
        dispositivo = 'cuda' if os.environ.get('WHISPER_GPU') == '1' else 'cpu'
        _modelo = WhisperModel(CFG['whisper'], device=dispositivo, compute_type='float16' if dispositivo == 'cuda' else 'int8')
        log('Whisper listo:', CFG['whisper'], dispositivo)
    segmentos, _ = _modelo.transcribe(archivo, language='es', vad_filter=True, beam_size=1)
    return ' '.join(s.text.strip() for s in segmentos).strip()

# ---------- vigías dados de alta ----------
def leer_vigias() -> dict:
    try:
        return json.loads(CFG['vigias'].read_text(encoding='utf-8'))
    except FileNotFoundError:
        return {}

def guardar_vigias(v: dict):
    CFG['vigias'].write_text(json.dumps(v, ensure_ascii=False, indent=1), encoding='utf-8')

# ---------- canal de la central: mismo formato que js/canal.js ----------
def a_tags(d: dict) -> list:
    return ['rs'] + [f'{k}={v}' for k, v in d.items() if v is not None]

def mensaje_vigia(uid_tg: int, puesto: str, texto: str) -> dict:
    uid = ''.join(random.choices(string.ascii_lowercase + string.digits, k=7))
    return {
        'topic': CFG['tema'],
        'title': f'Vigía en {PUESTOS.get(puesto, "río arriba")}: el río creció',
        'message': f'Telegram: «{texto[:300]}»',
        'tags': a_tags({'tipo': 'vigia', 'v': f'tg{uid_tg}', 'puesto': puesto, 'via': 'telegram', 'uid': uid}),
        'priority': 4,
    }

def publicar(msg: dict) -> list:
    """Publica en cada servidor ntfy (el propio primero). La central quita duplicados por uid."""
    ok = []
    for base in CFG['ntfy']:
        try:
            req = urllib.request.Request(base, data=json.dumps(msg).encode(), headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=8) as r:
                if r.status == 200:
                    ok.append(base)
        except Exception as e:
            log('ntfy falló', base, e)
    return ok

# ---------- lógica de cada mensaje ----------
def atender(m: dict):
    chat, user = m['chat']['id'], m['from']['id']
    texto = (m.get('text') or '').strip()
    vigias = leer_vigias()

    if texto.startswith('/start') or texto.startswith('/ayuda'):
        return responder(chat, 'Soy el vigía de El Río Suena. Si ves que el Piraí crece, mándame un AUDIO contando lo que ves '
                         '(«está creciendo, viene turbio»). Para darte de alta, la junta te pasa la clave: '
                         '/alta <clave> <puesto>. Puestos: ' + ', '.join(PUESTOS) + f'. Tu número de Telegram es {user}.')
    if texto.startswith('/alta'):
        partes = texto.split()
        if len(partes) != 3 or not CFG['clave'] or partes[1] != CFG['clave'] or partes[2].lower() not in PUESTOS:
            return responder(chat, 'No pude darte de alta. Escribe: /alta <clave de la junta> <puesto>. Puestos: ' + ', '.join(PUESTOS))
        vigias[str(user)] = {'nombre': m['from'].get('first_name', 'vigía'), 'puesto': partes[2].lower()}
        guardar_vigias(vigias)
        log('alta de vigía', user, partes[2])
        return responder(chat, f'Listo, quedaste como vigía en {PUESTOS[partes[2].lower()]}. Cuando el río crezca, mándame un audio.')

    vigia = vigias.get(str(user))
    if not vigia:
        return responder(chat, 'Todavía no estás dado de alta como vigía. Pide la clave a tu junta vecinal y escribe /alta <clave> <puesto>.')

    audio = m.get('voice') or m.get('audio')
    if audio:
        responder(chat, '🎧 Escuchando tu audio…')
        archivo = bajar_audio(audio['file_id'])
        try:
            texto = transcribir(archivo)
        finally:
            try: os.remove(archivo)
            except OSError: pass
        log('transcripción', user, repr(texto))
    if not texto:
        return responder(chat, 'No entendí el audio. ¿Puedes repetirlo más cerca del celular, o escribir lo que ves?')

    c = clasificar(texto, CFG['ollama'], CFG['ollama_modelo'])
    log('clasificación', user, c)
    if not c['crecida']:
        return responder(chat, f'Entendí: «{texto}». No lo conté como crecida ({c["fuente"]}). '
                         'Si el río está creciendo, dilo con más detalle o escribe solo: CRECIÓ')
    destinos = publicar(mensaje_vigia(user, vigia['puesto'], texto))
    if not destinos:
        return responder(chat, '⚠️ Entendí que el río crece, pero no pude avisar a la central (sin internet). Llama a la junta.')
    responder(chat, f'✅ Reporte enviado a la central como vigía de {PUESTOS[vigia["puesto"]]}.\nEntendí: «{texto}»\n'
              'Con dos vigías distintos se lanza la alerta en la ribera.')

def main():
    faltan = [k for k in ('token', 'tema') if not CFG[k]]
    if faltan:
        sys.exit(f'Faltan variables de entorno: {", ".join("TELEGRAM_TOKEN" if k == "token" else "TEMA" for k in faltan)} (ver nodo/.env.ejemplo)')
    log('bot del vigía en marcha · tema', CFG['tema'], '· ntfy', CFG['ntfy'], '· modelo IA', CFG['ollama'] or 'solo reglas')
    desde = 0
    while True:
        try:
            for u in tg('getUpdates', offset=desde, timeout=50, allowed_updates='["message"]'):
                desde = u['update_id'] + 1
                if 'message' in u:
                    try:
                        atender(u['message'])
                    except Exception as e:
                        log('error atendiendo mensaje:', e)
        except Exception as e:
            log('sin conexión con Telegram, reintento en 10 s:', e)
            time.sleep(10)

if __name__ == '__main__':
    main()
