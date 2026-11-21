"""Pruebas del bot del vigía (sin red, sin Whisper). Uso: python -m unittest test_bot.py"""
import json, os, tempfile, unittest, pathlib
from unittest import mock

os.environ.setdefault('TEMA', 'rio-suena-prueba')
import clasificar as C
import vigia_bot as B

class Reglas(unittest.TestCase):
    def test_reportes_de_crecida(self):
        for t in ['El río está creciendo, ya tapa la piedra grande', 'Viene turbio y arrastra palos',
                  'está subiendo rápido el agua', 'baja mazamorra por el río', 'CRECIÓ', 'crece!',
                  'ya llega a la marca del puente, viene fuerte']:
            self.assertTrue(C.por_reglas(t)['crecida'], t)

    def test_no_es_crecida(self):
        for t in ['El río está normal, todo tranquilo', 'no está creciendo', 'bajó el agua', 'hola buenas tardes',
                  'es una prueba nomás', 'no hay crecida por ahora']:
            self.assertFalse(C.por_reglas(t)['crecida'], t)

    def test_sin_modelo_usa_reglas(self):
        self.assertEqual(C.clasificar('está creciendo', ollama_url='')['fuente'], 'reglas')

    def test_modelo_caido_vuelve_a_reglas(self):
        r = C.clasificar('está creciendo', ollama_url='http://127.0.0.1:9')
        self.assertEqual(r['fuente'], 'reglas')

class Mensaje(unittest.TestCase):
    def test_formato_igual_a_canal_js(self):
        m = B.mensaje_vigia(12345, 'bermejo', 'está creciendo')
        self.assertEqual(m['topic'], 'rio-suena-prueba')
        tags = dict(t.split('=', 1) for t in m['tags'][1:])
        self.assertEqual(m['tags'][0], 'rs')
        self.assertEqual((tags['tipo'], tags['v'], tags['puesto'], tags['via']), ('vigia', 'tg12345', 'bermejo', 'telegram'))
        self.assertEqual(len(tags['uid']), 7)
        self.assertLessEqual(len(tags['v']), 20)  # la central corta v a 20 caracteres

class Flujo(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp(); B.CFG['vigias'] = pathlib.Path(self.dir, 'vigias.json'); B.CFG['clave'] = '1312'
        self.respuestas, self.publicados = [], []
        self.p1 = mock.patch.object(B, 'responder', lambda chat, t: self.respuestas.append(t))
        self.p2 = mock.patch.object(B, 'publicar', lambda msg: self.publicados.append(msg) or ['https://ntfy.sh/'])
        self.p1.start(); self.p2.start()
    def tearDown(self):
        self.p1.stop(); self.p2.stop()
    def msg(self, texto, user=7):
        return {'chat': {'id': user}, 'from': {'id': user, 'first_name': 'Ana'}, 'text': texto}

    def test_sin_alta_no_cuenta(self):
        B.atender(self.msg('está creciendo'))
        self.assertEqual(self.publicados, [])
        self.assertIn('no estás dado de alta', self.respuestas[-1])

    def test_alta_con_clave_y_reporte(self):
        B.atender(self.msg('/alta 0000 bermejo'))
        self.assertIn('No pude', self.respuestas[-1])
        B.atender(self.msg('/alta 1312 bermejo'))
        self.assertEqual(json.loads(B.CFG['vigias'].read_text())['7']['puesto'], 'bermejo')
        B.atender(self.msg('el río está creciendo, viene turbio'))
        self.assertEqual(len(self.publicados), 1)
        self.assertIn('✅', self.respuestas[-1])
        B.atender(self.msg('todo tranquilo por acá'))
        self.assertEqual(len(self.publicados), 1)  # no se publica lo que no es crecida

    def test_audio_se_transcribe(self):
        B.atender(self.msg('/alta 1312 espejos'))
        m = self.msg(''); m.pop('text'); m['voice'] = {'file_id': 'abc'}
        with mock.patch.object(B, 'bajar_audio', lambda fid: os.path.join(self.dir, 'a.oga')), \
             mock.patch.object(B, 'transcribir', lambda a: 'ya tapa la piedra grande, está creciendo'):
            B.atender(m)
        self.assertEqual(len(self.publicados), 1)
        self.assertIn('piedra grande', self.publicados[0]['message'])

if __name__ == '__main__':
    unittest.main()
