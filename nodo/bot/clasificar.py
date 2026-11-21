"""¿El vigía está reportando una crecida? Decide sobre el texto (transcrito de un audio o escrito).

Dos niveles:
1. Reglas en castellano boliviano (siempre disponibles, instantáneas).
2. Un modelo local con Ollama, si está configurado (OLLAMA_URL). Si no responde, quedan las reglas.

La IA solo clasifica y resume. La regla de la app no cambia: hacen falta 2 vigías distintos para la alerta.
"""
import json, re, unicodedata, urllib.request

def _norm(t: str) -> str:
    t = unicodedata.normalize('NFD', t.lower())
    return ''.join(c for c in t if unicodedata.category(c) != 'Mn')

# señales de crecida que usa la gente de la ribera ("baja turbio" = el río viene sucio y cargado)
SI = [
    r'\bcrec(e|io|iendo|ida)\b', r'\bsub(e|io|iendo)\b', r'\baument', r'\bdesbord', r'\bse (esta )?llenando\b',
    r'\bturbi', r'\bbarro\b', r'\bmazamorra\b', r'\bcabeza de agua\b', r'\bavenida\b', r'\briada\b',
    r'\barrastr', r'\btroncos?\b', r'\bpalos\b', r'\bruge\b', r'\brugido\b', r'\bsuena (fuerte|feo)\b',
    r'\btapa(ndo|do)?\b.*\b(piedra|regla|marca|puente)', r'\bya (llega|paso|esta) (a|la|el|por)\b',
    r'\bmucha agua\b', r'\bviene (fuerte|cargad|sucio|grande)', r'\bcrecio\b',
]
NO = [
    r'\bno (esta |ha |hay )?(crec|sub|desbord)', r'\b(esta |sigue )?(normal|tranquilo|calmado)\b',
    r'\bbajo el (agua|nivel|rio)\b', r'\besta bajando (el agua|el nivel)\b', r'\bnada (raro|nuevo)\b',
    r'\b(era|es) (una )?prueba\b',
]
PALABRA_CLAVE = re.compile(r'^\s*(crecio|crece|crecida|alerta)\s*[.!]*\s*$')  # el vigía puede forzar con una palabra

def por_reglas(texto: str) -> dict:
    t = _norm(texto)
    if PALABRA_CLAVE.match(t):
        return {'crecida': True, 'confianza': 'alta', 'motivo': 'palabra clave', 'fuente': 'reglas'}
    si = [p for p in SI if re.search(p, t)]
    no = [p for p in NO if re.search(p, t)]
    crecida = bool(si) and not no
    conf = 'alta' if len(si) >= 2 and not no else 'media' if crecida else 'baja'
    return {'crecida': crecida, 'confianza': conf, 'motivo': f'{len(si)} señales de crecida, {len(no)} en contra', 'fuente': 'reglas'}

PROMPT = """Eres el asistente de una red comunitaria de alerta de crecidas del río Piraí (Bolivia).
Un vigía río arriba mandó este mensaje (puede ser una transcripción automática con errores):
«{texto}»
¿Está reportando que el río está creciendo o viene con crecida (agua sube, viene turbio/cargado, arrastra palos, tapa una marca)?
Responde SOLO un JSON: {{"crecida": true|false, "confianza": "alta"|"media"|"baja", "resumen": "máx. 12 palabras en castellano"}}"""

def por_modelo(texto: str, url: str, modelo: str, timeout: float = 60) -> dict | None:
    """Pregunta a Ollama (/api/generate). Devuelve None si no hay modelo o la respuesta no sirve."""
    if not url:
        return None
    cuerpo = json.dumps({'model': modelo, 'prompt': PROMPT.format(texto=texto[:600]), 'stream': False, 'format': 'json',
                         'options': {'temperature': 0}}).encode()
    try:
        req = urllib.request.Request(url.rstrip('/') + '/api/generate', data=cuerpo, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            d = json.loads(json.loads(r.read())['response'])
        if not isinstance(d.get('crecida'), bool):
            return None
        return {'crecida': d['crecida'], 'confianza': str(d.get('confianza', 'media')), 'motivo': str(d.get('resumen', ''))[:120], 'fuente': f'modelo {modelo}'}
    except Exception:
        return None

def clasificar(texto: str, ollama_url: str = '', ollama_modelo: str = 'qwen2.5:3b') -> dict:
    """Reglas siempre; si hay modelo, manda el modelo, salvo que las reglas vean una palabra clave explícita."""
    r = por_reglas(texto)
    if r['motivo'] == 'palabra clave':
        return r
    m = por_modelo(texto, ollama_url, ollama_modelo)
    return m or r
