// "El agua en tu pared": cámara + capa de agua a la altura estimada.
// Calibración: tocar el piso y luego el borde de arriba de una puerta (2,00 m).
export class Pared {
  constructor(video, canvas, info) {
    this.v = video; this.cv = canvas; this.g = canvas.getContext('2d'); this.info = info;
    this.piso = null; this.techo = null; this.metrosRef = 2.0; this.altura = 1.2; this.actual = 0; this.ola = 0;
    canvas.addEventListener('pointerdown', e => this._toque(e));
    new ResizeObserver(() => this._tam()).observe(canvas);
    this._tam(); this.raf = 0;
  }
  // al girar el celular se reescalan las marcas en vez de perder la calibración
  _tam() {
    const r = this.cv.getBoundingClientRect(), w = Math.round(r.width * devicePixelRatio), h = Math.round(r.height * devicePixelRatio);
    if (!w || !h || (w === this.cv.width && h === this.cv.height)) return;
    const k = this.cv.height ? h / this.cv.height : 1;
    if (this.piso != null) this.piso *= k; if (this.techo != null) this.techo *= k;
    this.cv.width = w; this.cv.height = h;
  }
  async camara() {
    this.apagar(); this._iniciar();
    const pedido = this.pedido = Symbol();
    this.piso = this.techo = null; this.actual = 0; this.sinCamara = false; this.info.textContent = 'Pidiendo la cámara…';
    let reloj;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('sin cámara');
      const pide = navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      // si el permiso llega tarde (después de los 8 s o con la pantalla ya cerrada) se apaga: si no, la cámara queda prendida
      let tarde = false;
      pide.then(s => { if (tarde || pedido !== this.pedido) s.getTracks().forEach(t => t.stop()); }, () => {});
      // si el permiso no llega en 8 s, seguimos con la pared dibujada
      const espera = new Promise((_, no) => { reloj = setTimeout(() => { tarde = true; no(new Error('sin respuesta')); }, 8000); });
      const s = await Promise.race([pide, espera]);
      if (pedido !== this.pedido) return;
      this.stream = s; this.v.srcObject = s; await this.v.play();
    } catch { if (pedido === this.pedido) { this.stream?.getTracks().forEach(t => t.stop()); this.stream = null; this.sinCamara = true; this.v.srcObject = null; } }
    finally { clearTimeout(reloj); }
    if (pedido === this.pedido) this._msg();
  }
  /** Apaga cámara y animación (se llama al cerrar la pantalla, también con Esc). */
  apagar() {
    this.pedido = null;
    this.stream?.getTracks().forEach(t => t.stop()); this.stream = null; this.v.srcObject = null;
    cancelAnimationFrame(this.raf); this.raf = 0;
  }
  calibrarSolo() { const h = this.cv.height; this.piso = h * 0.92; this.techo = h * 0.22; this._msg(); }
  ponerAltura(m) { this.altura = m; this.actual = 0; this._msg(); }
  _toque(e) {
    const r = this.cv.getBoundingClientRect(), y = (e.clientY - r.top) * devicePixelRatio;
    if (this.piso == null) this.piso = y; else if (this.techo == null && y < this.piso) this.techo = y; else { this.piso = y; this.techo = null; }
    this.actual = 0; this._msg();
  }
  _msg() {
    const t = this.piso == null ? 'Toca el PISO junto a una puerta' : this.techo == null ? 'Ahora toca el BORDE DE ARRIBA de la puerta (2 m)' : `Aquí llegaría el agua: ${this.altura.toFixed(2).replace('.', ',')} m`;
    this.info.textContent = t;
  }
  _iniciar() {
    if (this.raf) return;
    const paso = () => {
      this.raf = requestAnimationFrame(paso);
      const { g, cv } = this, w = cv.width, h = cv.height; g.clearRect(0, 0, w, h);
      if (this.sinCamara) fondoPared(g, w, h);
      const dpr = devicePixelRatio;
      if (this.piso != null) { g.fillStyle = '#5be7f0'; g.fillRect(0, this.piso - dpr, w, 2 * dpr); }
      if (this.piso == null || this.techo == null) return;
      g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(0, this.techo - dpr, w, 2 * dpr);
      const pxM = (this.piso - this.techo) / this.metrosRef;
      this.actual += (this.altura - this.actual) * 0.012; this.ola += 0.05;
      const top = this.piso - this.actual * pxM;
      const gr = g.createLinearGradient(0, top, 0, h);
      gr.addColorStop(0, 'rgba(120,90,50,.78)'); gr.addColorStop(1, 'rgba(60,45,25,.92)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(0, h);
      for (let x = 0; x <= w; x += 8 * dpr) g.lineTo(x, top + Math.sin(x / (40 * dpr) + this.ola) * 5 * dpr + Math.sin(x / (17 * dpr) - this.ola * 1.7) * 2 * dpr);
      g.lineTo(w, h); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(230,240,255,.8)'; g.lineWidth = 2 * dpr; g.stroke();
      g.font = `600 ${18 * dpr}px "Space Grotesk", sans-serif`; g.fillStyle = '#fff'; g.textAlign = 'left';
      g.fillText(`${this.actual.toFixed(2).replace('.', ',')} m`, 16 * dpr, top - 12 * dpr);
    };
    this.raf = requestAnimationFrame(paso);
  }
}
function fondoPared(g, w, h) {
  g.fillStyle = '#d9cbb4'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#c9b89c'; for (let y = 0; y < h; y += 34) g.fillRect(0, y, w, 1);
  g.fillStyle = '#6b4a2f'; g.fillRect(w * 0.55, h * 0.22, w * 0.22, h * 0.70);
  g.fillStyle = '#e8c070'; g.beginPath(); g.arc(w * 0.74, h * 0.6, 6, 0, 7); g.fill();
  g.fillStyle = '#8a7a64'; g.fillRect(0, h * 0.92, w, h * 0.08);
}
