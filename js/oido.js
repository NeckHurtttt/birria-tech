// "Oído del río": escucha el rugido grave de una crecida (piedras arrastradas)
// y lo compara con el sonido normal del río (línea base).
export class Oido {
  constructor(canvas, { onNivel, onDetecta } = {}) {
    this.cv = canvas; this.g = canvas.getContext('2d');
    this.onNivel = onNivel || (() => {}); this.onDetecta = onDetecta || (() => {});
    this.base = null; this.muestrasBase = 0; this.sobre = 0; this.detectado = false;
    this.fuente = null; this.extra = [];
  }
  _ctx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.an = this.ctx.createAnalyser(); this.an.fftSize = 4096; this.an.smoothingTimeConstant = 0.55;
      this.datos = new Float32Array(this.an.frequencyBinCount);
      this._bucle();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  reiniciar() { this.base = null; this.muestrasBase = 0; this.sobre = 0; this.detectado = false; }
  detener() {
    this.extra.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch {} });
    this.extra = [];
    if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
    if (this.fuente) { try { this.fuente.disconnect(); } catch {} this.fuente = null; }
  }
  async microfono() {
    const ctx = this._ctx(); this.detener(); this.reiniciar();
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    this.fuente = ctx.createMediaStreamSource(this.stream); this.fuente.connect(this.an);
    this.modo = 'micrófono';
  }
  /** Simulacro: 4 s de río normal y después la crecida con piedras. Se escucha por el parlante. */
  simular({ sonar = true } = {}) {
    const ctx = this._ctx(); this.detener(); this.reiniciar();
    const seg = 40, sr = ctx.sampleRate, buf = ctx.createBuffer(1, seg * sr, sr), d = buf.getChannelData(0);
    let ult = 0;
    for (let i = 0; i < d.length; i++) { ult = (ult + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = ult * 3.2; }
    // piedras: golpes graves cada vez más seguidos
    for (let t = 4; t < seg; t += 0.05 + Math.random() * Math.max(0.05, 0.9 - (t - 4) * 0.08)) {
      const i0 = Math.floor(t * sr), f = 60 + Math.random() * 120, dur = 0.08 + Math.random() * 0.12, a = Math.min(1, (t - 4) / 6) * (0.4 + Math.random() * 0.6);
      for (let j = 0; j < dur * sr && i0 + j < d.length; j++) d[i0 + j] += a * Math.sin(2 * Math.PI * f * j / sr) * Math.exp(-j / (dur * sr / 4));
    }
    const src = ctx.createBufferSource(); src.buffer = buf;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    const gan = ctx.createGain(), t0 = ctx.currentTime;
    gan.gain.setValueAtTime(0.05, t0); gan.gain.setValueAtTime(0.05, t0 + 4); gan.gain.linearRampToValueAtTime(0.9, t0 + 11);
    src.connect(lp).connect(gan); gan.connect(this.an);
    const vol = ctx.createGain(); vol.gain.value = sonar ? 0.5 : 0; gan.connect(vol).connect(ctx.destination);
    src.start(); this.extra.push(src, gan, vol); this.fuente = gan; this.modo = 'simulacro';
  }
  // Con setInterval (no requestAnimationFrame) para que el tiempo sea real aunque la compu vaya lenta.
  _bucle() {
    let antes = performance.now();
    const paso = () => {
      const ahora = performance.now(), dt = Math.min(0.5, (ahora - antes) / 1000); antes = ahora;
      this.an.getFloatFrequencyData(this.datos);
      const hz = this.ctx.sampleRate / this.an.fftSize;
      let bajo = 0, total = 0;
      for (let i = 1; i < this.datos.length; i++) {
        const f = i * hz; if (f > 8000) break;
        const p = Math.pow(10, this.datos[i] / 10); total += p; if (f >= 20 && f <= 300) bajo += p;
      }
      if (!this.fuente) { this._dibujar(hz, 0); return; }
      if (this.muestrasBase < 2.5) { // 2,5 s de calibración
        this.base = this.base == null ? bajo : this.base * 0.9 + bajo * 0.1; this.muestrasBase += dt;
        this.onNivel({ estado: 'calibrando', ratio: 1, intensidad: 1, avance: this.muestrasBase / 2.5 });
        this._dibujar(hz, 0); return;
      }
      const base = Math.max(this.base, 1e-9), ratio = bajo / base;
      const intensidad = Math.min(4, Math.max(1, 1 + Math.log10(ratio) * 1.2));
      if (!this.detectado && ratio < 2) this.base = base * (1 - 0.1 * dt) + bajo * 0.1 * dt; // el río normal cambia despacio
      this.sobre = ratio > 6 ? this.sobre + dt : Math.max(0, this.sobre - 2 * dt);
      this.onNivel({ estado: this.detectado ? 'crecida' : ratio > 3 ? 'subiendo' : 'normal', ratio, intensidad, avance: Math.min(1, this.sobre / 1.5) });
      if (!this.detectado && this.sobre > 1.5) { this.detectado = true; this.onDetecta({ intensidad, ratio }); }
      this._dibujar(hz, intensidad);
    };
    setInterval(paso, 40);
  }
  _dibujar(hz) {
    const { cv, g } = this, w = cv.width, h = cv.height;
    g.drawImage(cv, -2, 0);
    const fmax = 2000;
    // ganancia automática: los colores se escalan al máximo reciente para no saturar
    let mx = -200; for (let i = 1; i < this.datos.length && i * hz < fmax; i++) mx = Math.max(mx, this.datos[i]);
    this.techoDb = Math.max(mx, (this.techoDb ?? mx) - 0.15);
    const piso = Math.max(-140, this.techoDb - 60);
    for (let y = 0; y < h; y++) {
      const f = 20 * Math.pow(fmax / 20, 1 - y / h), i = Math.round(f / hz);
      const db = this.datos[i] ?? -140, v = Math.min(1, Math.max(0, (db - piso) / (this.techoDb - piso + 1e-6))) ** 1.4;
      g.fillStyle = color(v); g.fillRect(w - 2, y, 2, 1);
    }
    g.fillStyle = 'rgba(255,255,255,.08)'; const y300 = h * (1 - Math.log(300 / 20) / Math.log(fmax / 20)); g.fillRect(0, y300, w, 1);
  }
}
function color(v) {
  const p = [[6, 18, 32], [10, 70, 110], [20, 170, 190], [250, 200, 70], [255, 70, 60]];
  const x = v * (p.length - 1), i = Math.min(p.length - 2, Math.floor(x)), t = x - i;
  const c = p[i].map((a, k) => Math.round(a + (p[i + 1][k] - a) * t));
  return `rgb(${c})`;
}
