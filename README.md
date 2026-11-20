<div align="center">

<img src="icono.svg" width="72" alt="">

# El Río Suena

**Cuando el río suena, piedras trae** · *When the river roars, it brings stones* · *河水作响，必有石来*

Alerta temprana de crecidas del río Piraí (Santa Cruz, Bolivia) para quien no puede evacuar solo.

![JavaScript](https://img.shields.io/badge/JavaScript-ES2022_modules-F7DF1E?logo=javascript&logoColor=000)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=fff)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=fff)
![Web Audio](https://img.shields.io/badge/Web_Audio-FFT-5be7f0)
![MapLibre](https://img.shields.io/badge/MapLibre_GL-396CB2?logo=maplibre&logoColor=fff)
![Node](https://img.shields.io/badge/tests-node%20pruebas.mjs-339933?logo=nodedotjs&logoColor=fff)
![Backend](https://img.shields.io/badge/backend-ninguno%20%2F%20none%20%2F%20无-071219)

**Abstracthon 2026 · Track Ayuda Tecnológica**

<img src="capturas/escritorio-guardianes.png" width="820" alt="Central de alerta: oído del río, cuenta regresiva por barrio y vecinos guardianes">

<sub>Elige tu idioma · Choose your language · 选择语言 &nbsp;⬇️ &nbsp;(se abre aquí mismo, sin recargar · opens in place, no reload · 原地展开，无需刷新)</sub>

</div>

<details open>
<summary><b>🇧🇴 Español</b></summary>

### En una frase
Celulares viejos escuchan el rugido de las piedras río arriba, avisan **cuánto falta** en cada barrio y hacen sonar el celular del **vecino guardián** de cada persona que no puede salir sola.

### El problema
Las riadas del Piraí llegan de noche y las alertas actuales son por colores y para todo el departamento. Nadie le dice a cada cuadra cuánto tiempo tiene, y quien está en silla de ruedas, quien no oye o los niños solos dependen de la suerte.

### Lo que hace
| | |
|---|---|
| 🎧 **Oído del río** | Un celular donado en el puente compara el rugido grave (20–300 Hz) con el sonido normal del río. La lluvia real río arriba y la foto de una regla pintada confirman o descartan la alarma. |
| ⏱️ **Cuenta regresiva** | «El agua llega a El Torno en 2 h 20 min», calculado sobre el cauce real. |
| 📱 **El agua en tu pared** | La cámara muestra hasta dónde subiría el agua en tu propia casa. |
| 🤝 **Vecino guardián** | El celular del guardián suena y vibra; confirma con un toque. Si nadie confirma 30 min antes, el caso pasa al rescate oficial. |

### Cómo usar la demo (3 minutos)
1. Abre `index.html?jurado` y toca **Iniciar simulacro**.
2. El oído calibra, escucha el río normal y detecta la crecida (se oye por el parlante).
3. Mira la cuenta regresiva en el mapa y en la lista de barrios.
4. **Celular del guardián** → escanea el QR con otro celular → toca **Activar avisos**. Cuando suene, toca **Ya la ayudé**.
5. Confirma al resto desde la central → aparece **Todos a salvo**.
6. Extra: **El agua en tu pared** (cámara) y **Foto de la regla** (3 toques sobre una foto).

### Correrlo
```bash
python3 -m http.server 8765
```
Abre `http://localhost:8765/?jurado`. La cámara y el micrófono piden HTTPS o `localhost`. `?x=300` acelera el reloj del simulacro.

```bash
node pruebas.mjs
```

### Lenguajes y tecnología
**JavaScript** (módulos ES, sin framework ni compilación) · **HTML5** · **CSS3** · Web Audio, MediaDevices, BroadcastChannel, Web Speech · MapLibre GL + OpenFreeMap · ntfy.sh · Open-Meteo. Python solo se usa como servidor local y Node.js para las pruebas.

Funciona **sin internet**: tiene lluvia de respaldo, un mapa liso, una pared dibujada si no hay cámara y el canal local entre pestañas.

### Honestidad
Las distancias, velocidades y alturas son **estimadas** y deben calibrarse con SEARPI y el COED. La detección acústica es un prototipo que complementa a las estaciones oficiales y no las reemplaza. Las personas de la demo son ficticias, y el tema público de ntfy sirve solo para la demo.

</details>

<details>
<summary><b>🇬🇧 English</b></summary>

### In one sentence
Old phones listen to the roar of boulders upstream, tell every neighbourhood **how much time is left**, and ring the phone of the **guardian neighbour** assigned to each person who cannot evacuate alone.

### The problem
Flash floods on the Piraí river (Santa Cruz, Bolivia) often arrive at night, and today's warnings are colour codes for the whole department. Nobody tells each block how long it has. Wheelchair users, deaf neighbours and children home alone are left to luck.

### What it does
| | |
|---|---|
| 🎧 **River ear** | A donated phone on a bridge compares the low roar (20–300 Hz) of rolling stones against the river's normal baseline. Real upstream rainfall and a photo of a painted gauge confirm or dismiss the alarm. |
| ⏱️ **Countdown** | "Water reaches El Torno in 2 h 20 min", computed along the real river channel. |
| 📱 **Water on your wall** | The camera shows how high the water would rise on your own house. |
| 🤝 **Guardian neighbour** | The guardian's phone rings and vibrates, and one tap confirms the person is safe. If nobody confirms 30 min before arrival, the case goes to official rescue. |

### Demo walkthrough (3 minutes)
1. Open `index.html?jurado` and press **Iniciar simulacro** (*start drill*).
2. The ear calibrates, hears the normal river, then detects the flood (audible through the speaker).
3. Watch the countdown on the map and in the neighbourhood list.
4. **Celular del guardián** → scan the QR code with a second phone → **Activar avisos**. When it rings, tap **Ya la ayudé** (*I helped her*).
5. Confirm the rest from the control room → **Todos a salvo** (*everyone safe*).
6. Bonus: **El agua en tu pared** (camera AR) and **Foto de la regla** (read a gauge with 3 taps).

> The interface is in Spanish because it is built for Santa Cruz residents.

### Run it
```bash
python3 -m http.server 8765
```
Open `http://localhost:8765/?jurado`. Camera and microphone need HTTPS or `localhost`. Use `?x=300` to speed up the drill clock.

```bash
node pruebas.mjs
```

### Languages & stack
**JavaScript** (ES modules, no framework, no build step) · **HTML5** · **CSS3** · Web Audio, MediaDevices, BroadcastChannel, Web Speech · MapLibre GL + OpenFreeMap · ntfy.sh · Open-Meteo. Python is only the local server and Node.js only runs the tests.

It works **offline**, with fallback rainfall, a plain map, a drawn wall when there is no camera, and a local tab-to-tab channel.

### Honest limits
Distances, speeds and water heights are **estimates** that must be calibrated with SEARPI and COED. Acoustic detection is a prototype that complements official gauges and does not replace them. The people in the demo are fictional, and the public ntfy topic is for the demo only.

</details>

<details>
<summary><b>🇨🇳 中文</b></summary>

### 一句话介绍
旧手机在上游"聆听"河床巨石滚动的轰鸣，告诉每个街区**洪水还有多久到达**，并让每位无法独自撤离者的**守护邻居**手机响铃振动。

### 问题
玻利维亚圣克鲁斯的皮赖河（Piraí）山洪常在夜间来袭。现有预警只是覆盖全省的颜色等级，没有人告诉每个街区还剩多少时间。轮椅使用者、听障者、独自在家的儿童只能听天由命。

### 功能
| | |
|---|---|
| 🎧 **河之耳** | 架在桥上的捐赠手机，把低频轰鸣（20–300 Hz）与河流平时的声音基线对比。上游实时降雨量和水位标尺照片用来确认警报或排除误报。 |
| ⏱️ **倒计时** | 例如"洪水 2 小时 20 分钟后到达 El Torno"，按真实河道计算。 |
| 📱 **水淹到你家墙上** | 用摄像头直观显示洪水会在自家墙上涨到多高。 |
| 🤝 **守护邻居** | 守护人的手机响铃并振动，一键确认已把人带到安全处。到达前 30 分钟仍无人确认，就转交官方救援。 |

### 演示步骤（3 分钟）
1. 打开 `index.html?jurado`，点击 **Iniciar simulacro**（开始演练）。
2. "河之耳"先校准，听到正常河水声，随后检测到洪水（扬声器可听到）。
3. 在地图和街区列表中查看倒计时。
4. 点击 **Celular del guardián** → 用第二部手机扫描二维码 → 点 **Activar avisos**（开启提醒）。响铃后点 **Ya la ayudé**（我已帮她撤离）。
5. 在指挥中心确认其余人员 → 出现 **Todos a salvo**（全员安全）。
6. 附加功能：**El agua en tu pared**（摄像头 AR）和 **Foto de la regla**（在照片上点 3 下读取水位）。

> 界面为西班牙语，因为它是为圣克鲁斯当地居民设计的。

### 运行
```bash
python3 -m http.server 8765
```
打开 `http://localhost:8765/?jurado`。摄像头和麦克风需要 HTTPS 或 `localhost`。加上 `?x=300` 可加快演练时钟。

```bash
node pruebas.mjs
```

### 编程语言与技术
**JavaScript**（ES 模块，无框架、无需构建）· **HTML5** · **CSS3** · Web Audio、MediaDevices、BroadcastChannel、Web Speech · MapLibre GL + OpenFreeMap · ntfy.sh · Open-Meteo。Python 仅用作本地服务器，Node.js 仅用于运行测试。

可**离线运行**：有备用降雨数据、纯色底图、无摄像头时的绘制墙面，以及同一电脑上标签页之间的本地通道。

### 坦诚说明
距离、流速和水深均为**估算值**，需与 SEARPI 和 COED 校准。声学检测是原型，用于补充官方水文站，而不是取代它们。演示中的人物均为虚构，公共 ntfy 主题仅供演示使用。

</details>

---

<div align="center"><sub>Hecho en Santa Cruz para Abstracthon 2026 · Made in Santa Cruz · 圣克鲁斯制作</sub></div>
