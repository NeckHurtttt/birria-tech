// Idioma de la interfaz: castellano (original), inglés y chino, sin recargar la página.
// La app sigue escribiendo en castellano; aquí se traduce lo que se ve en pantalla (textos, títulos,
// placeholders y lo que se lee en voz alta). Así los datos (valores de formularios, CSV, mensajes a los
// guardianes por SMS/ntfy) no cambian: van en castellano para la ribera del Piraí.
export const IDIOMAS = [
  { id: 'es', corto: 'ES', nombre: 'Español', voz: 'es-419', html: 'es' },
  { id: 'en', corto: 'EN', nombre: 'English', voz: 'en-US', html: 'en' },
  { id: 'zh', corto: '中文', nombre: '中文', voz: 'zh-CN', html: 'zh-Hans' },
];
const CLAVE = 'rs-idioma';

// ---------- textos fijos ----------
const D = {
  // barra y paneles
  'Cuando el río suena, piedras trae': ['When the river roars, it brings stones', '河水作响，必有石来'],
  'Lluvia…': ['Rain…', '降雨…'],
  'Sin internet · última alerta guardada': ['Offline · last alert saved', '离线 · 已保存最近一次警报'],
  'Sé ayudante': ['Be a helper', '成为帮手'],
  'Iniciar simulacro': ['Start drill', '开始演练'],
  'Reiniciar simulacro': ['Restart drill', '重新演练'],
  'Vigía del Piraí': ['Piraí Watch', '皮拉伊河守望'],
  'escaneando…': ['scanning…', '扫描中…'],
  'normal': ['normal', '正常'],
  'vigilancia': ['watch', '关注'],
  'alerta': ['alert', '警报'],
  'riesgo': ['risk', '风险'],
  // panel de mensajes de emergencia (PR #10)
  'Mensajes de emergencia': ['Emergency messages', '紧急消息'],
  'sin reportes': ['no reports', '暂无报告'],
  'aviso': ['warning', '预警'],
  'Ver en el mapa': ['See it on the map', '在地图上查看'],
  'Volver a leer este mensaje': ['Read this message again', '重新阅读这条消息'],
  'Reportes de vecinos por tramo del río, en orden de llegada. Toca uno para verlo en el mapa.': ['Neighbor reports by river stretch, in order of arrival. Tap one to see it on the map.', '按河段排列的邻居报告，按到达顺序显示。点击即可在地图上查看。'],
  'Sin mensajes. Al iniciar el simulacro, aquí aparecen los avisos de cada tramo del río a medida que baja la crecida.': ['No messages yet. When the drill starts, warnings from each river stretch appear here as the flood moves downstream.', '暂无消息。演练开始后，洪水向下游推进时，各河段的预警会出现在这里。'],
  'Datos abiertos de la cuenca alta · sin sensores ni hardware': ['Open data from the upper basin · no sensors or hardware', '上游流域开放数据 · 无需传感器或硬件'],
  'Lluvia en la cuenca alta': ['Rain in the upper basin', '上游流域降雨'],
  'Caudal en La Angostura': ['Discharge at La Angostura', 'La Angostura 流量'],
  'Reportes de vecinos': ['Neighbor reports', '邻居报告'],
  '5 puntos · Open-Meteo': ['5 points · Open-Meteo', '5 个点 · Open-Meteo'],
  'La lluvia en Samaipata y Bermejo tarda unas 2 h 30 min en bajar hasta La Angostura: ese es el tiempo que ganamos.':
    ['Rain in Samaipata and Bermejo takes about 2 h 30 min to reach La Angostura: that is the time we gain.', 'Samaipata 和 Bermejo 的降雨约需 2 小时 30 分钟才流到 La Angostura：这就是我们争取到的时间。'],
  'Vigilancia: el riesgo sube. Pedimos a los vecinos de la ribera foto de la regla.':
    ['Watch: the risk is rising. We ask riverside neighbors for a photo of the gauge.', '关注：风险正在上升。请河岸邻居拍摄水尺照片。'],
  'Simulacro: tormenta en la cuenca alta (datos reales de hoy como punto de partida)':
    ['Drill: storm in the upper basin (today’s real data as the starting point)', '演练：上游流域暴雨（以今天的真实数据为起点）'],
  'Ribera: «creció»': ['Riverside: “it rose”', '河岸：「涨水了」'],
  'Vigía río arriba': ['Upstream watcher', '上游观察员'],
  'Regla': ['Gauge', '水尺'],
  '¿Habría avisado la riada real del 13/12/2025?': ['Would it have warned of the real flood of 13 Dec 2025?', '能否预警 2025 年 12 月 13 日的真实洪灾？'],
  'Extra opcional: oído del río (micrófono)': ['Optional extra: river ear (microphone)', '可选：河之耳（麦克风）'],
  'El rugido grave (20–300 Hz) de las piedras arrastradas sube antes que el nivel del agua.':
    ['The low rumble (20–300 Hz) of rolling stones rises before the water level does.', '被冲走的石块发出的低频轰鸣（20–300 Hz）会先于水位上升。'],
  'Escuchar con micrófono': ['Listen with microphone', '用麦克风收听'],
  'apagado': ['off', '关闭'],
  'calibrando': ['calibrating', '校准中'],
  'subiendo': ['rising', '上升中'],
  'crecida': ['flood', '洪水'],
  'Aprendiendo cómo suena el río normal…': ['Learning what the normal river sounds like…', '正在学习河流平时的声音…'],
  'Río normal. Escuchando el rugido grave (20–300 Hz).': ['Normal river. Listening for the low rumble (20–300 Hz).', '河流正常。正在监听低频轰鸣（20–300 Hz）。'],
  'No se pudo usar el micrófono (permiso negado o sin HTTPS). Usa «Iniciar simulacro».':
    ['Could not use the microphone (permission denied or no HTTPS). Use “Start drill”.', '无法使用麦克风（权限被拒绝或没有 HTTPS）。请使用「开始演练」。'],
  'Cuenta regresiva por barrio': ['Countdown per neighborhood', '各社区倒计时'],
  'Tiempos y alturas estimados para el prototipo; se calibran con SEARPI y el COED.':
    ['Times and heights are prototype estimates, to be calibrated with SEARPI and COED.', '时间与水深为原型估算值，需与 SEARPI 和 COED 校准。'],
  'sin crecida': ['no flood', '无洪水'],
  'El agua llegó': ['Water has arrived', '洪水已到达'],
  'ya llegó': ['already here', '已到达'],
  'Vecinos Ayudantes': ['Neighbor Helpers', '邻居帮手'],
  'Celular del ayudante': ['Helper’s phone', '帮手手机'],
  'Quien no puede salir solo tiene un vecino asignado. Si nadie confirma, pasa al rescate oficial.':
    ['Anyone who can’t leave alone has an assigned neighbor. If nobody confirms, the case goes to official rescue.', '无法独自撤离的人都有一位指定邻居。若无人确认，则转交官方救援。'],
  'Apoyo prioritario y enlace con rescate oficial': ['Priority support, linked to official rescue', '优先协助，并对接官方救援'],
  'Celular del ayudante: escanea el QR y recibe la alerta': ['Helper’s phone: scan the QR and get the alert', '帮手手机：扫描二维码即可接收警报'],
  'Silla de ruedas': ['Wheelchair', '轮椅'],
  'No oye · señas': ['Deaf · sign language', '听障 · 手语'],
  'Solos hasta 19:00': ['Alone until 7 pm', '独自在家至 19:00'],
  'Habla quechua': ['Speaks Quechua', '说克丘亚语'],
  'sin alerta': ['no alert', '无警报'],
  'avisado': ['alerted', '已通知'],
  'a salvo': ['safe', '安全'],
  'al rescate': ['to rescue', '转交救援'],
  'pendiente': ['pending', '待审批'],
  'Confirmar desde aquí': ['Confirm from here', '在此确认'],
  'Confirmar evacuación': ['Confirm evacuation', '确认撤离'],
  'evacuado': ['evacuated', '已撤离'],
  'Rescate oficial confirmó': ['Official rescue confirmed', '官方救援已确认'],
  'Llamar': ['Call', '拨打'],
  'Registrar persona': ['Register a person', '登记人员'],
  'Panel de la junta / COED': ['Board / COED panel', '社区委员会 / COED 面板'],
  'El agua en tu pared': ['Water on your wall', '墙上的水位'],
  // pared y regla
  'Calibrar solo': ['Auto-calibrate', '自动校准'],
  'Cerrar': ['Close', '关闭'],
  'Pidiendo la cámara…': ['Asking for the camera…', '正在请求摄像头…'],
  'Toca el PISO junto a una puerta': ['Tap the FLOOR next to a door', '点击门旁的地面'],
  'Ahora toca el BORDE DE ARRIBA de la puerta (2 m)': ['Now tap the TOP EDGE of the door (2 m)', '再点击门的上沿（2 米）'],
  'Lectura de la regla pintada': ['Reading the painted gauge', '读取水尺'],
  'Toca la línea del agua': ['Tap the waterline', '点击水面线'],
  'La marca de 3 m tiene que estar arriba del 0. Prueba de nuevo.': ['The 3 m mark must be above 0. Try again.', '3 米刻度必须在 0 之上。请重试。'],
  'No se pudo leer esa imagen.': ['Could not read that image.', '无法读取该图片。'],
  // QR
  'Escanea con tu celular y toca «Activar avisos». Cuando el río suene, tu celular va a sonar y vibrar.':
    ['Scan with your phone and tap “Turn on alerts”. When the river roars, your phone will ring and vibrate.', '用手机扫码并点击「开启提醒」。河水作响时，你的手机会响铃并振动。'],
  'Para que suene con la pantalla apagada: app': ['To ring with the screen off: the', '要在锁屏时也响铃：'],
  '→ suscribirse al tema': ['app → subscribe to the topic', 'App → 订阅主题'],
  'QR no disponible': ['QR not available', '二维码不可用'],
  // registro
  'Registrar a quien no puede salir solo': ['Register someone who can’t leave alone', '登记无法独自撤离的人'],
  'Llega al registro compartido de la junta vecinal. Cuando la junta lo aprueba, su ayudante recibe la alerta. Sin internet se guarda aquí y se envía después.':
    ['It goes to the neighborhood board’s shared register. Once the board approves it, the helper receives the alert. Offline, it is saved here and sent later.', '登记会进入社区委员会的共享名册。委员会审批后，其帮手就会收到警报。离线时先保存在本机，联网后再发送。'],
  'Nombre': ['Name', '姓名'],
  'Edad': ['Age', '年龄'],
  '¿Qué necesita?': ['What do they need?', '需要什么帮助？'],
  'Barrio': ['Neighborhood', '社区'],
  'Cuadra / referencia': ['Block / landmark', '街区 / 地标'],
  'Vecino ayudante': ['Helper neighbor', '帮手邻居'],
  'Cómo avisarle': ['How to alert them', '通知方式'],
  'castellano': ['Spanish', '西班牙语'],
  'señas (LSB)': ['sign language (LSB)', '手语（LSB）'],
  'quechua': ['Quechua', '克丘亚语'],
  'guaraní': ['Guaraní', '瓜拉尼语'],
  'aimara': ['Aymara', '艾马拉语'],
  'Registrar': ['Register', '登记'],
  'silla de ruedas, no oye, niños solos…': ['wheelchair, deaf, children alone…', '轮椅、听障、儿童独自在家…'],
  'Cuadra 3, casa verde': ['Block 3, green house', '第 3 街区，绿色房子'],
  'Doña Carmen Rojas': ['Doña Carmen Rojas', 'Doña Carmen Rojas'],
  // junta
  'Panel de la junta vecinal y del COED': ['Neighborhood board and COED panel', '社区委员会与 COED 面板'],
  'Clave de la junta': ['Board key', '委员会密钥'],
  'Entrar': ['Sign in', '进入'],
  'Persona': ['Person', '人员'],
  'Dónde': ['Where', '地点'],
  'Necesita': ['Needs', '需求'],
  'Ayudante': ['Helper', '帮手'],
  'Estado': ['Status', '状态'],
  'Exportar CSV': ['Export CSV', '导出 CSV'],
  'Imprimir lista': ['Print list', '打印名单'],
  'Aprobar': ['Approve', '批准'],
  'QR ayudante': ['Helper QR', '帮手二维码'],
  'Quitar': ['Remove', '移除'],
  'Clave de la junta incorrecta.': ['Wrong board key.', '委员会密钥错误。'],
  'Registro solo en este celular (sin registro compartido configurado).': ['Register on this phone only (no shared register configured).', '仅在本机登记（未配置共享名册）。'],
  // riada 2025
  '¿El Río Suena habría avisado la riada del 13/12/2025?': ['Would El Río Suena have warned of the 13 Dec 2025 flood?', '“河水作响”能否预警 2025 年 12 月 13 日的洪灾？'],
  'La madrugada del 13 de diciembre de 2025 el Piraí se desbordó en El Torno; al menos 20 personas murieron según la prensa. Repetimos esa noche hora por hora con los datos abiertos que había.':
    ['In the early hours of 13 December 2025 the Piraí overflowed in El Torno; at least 20 people died, according to the press. We replay that night hour by hour with the open data that existed.', '2025 年 12 月 13 日凌晨，皮拉伊河在 El Torno 决堤；据媒体报道，至少 20 人遇难。我们用当时已有的开放数据逐小时重演那一夜。'],
  'umbral de alerta (55)': ['alert threshold (55)', '警报阈值（55）'],
  '2 vigías: «creció»': ['2 watchers: “it rose”', '2 名观察员：「涨水了」'],
  'desborde': ['overflow', '决堤'],
  'lluvia por hora (modelos)': ['hourly rain (models)', '每小时降雨（模型）'],
  'riesgo solo con modelos': ['risk with models only', '仅用模型的风险'],
  'riesgo con vigías río arriba': ['risk with upstream watchers', '加上上游观察员的风险'],
  'Solo modelos abiertos': ['Open models only', '仅开放模型'],
  'no habría alertado': ['it would not have alerted', '不会发出警报'],
  '. La tormenta del Amboró fue demasiado local para los modelos globales.': ['. The Amboró storm was too local for global models.', '。Amboró 的暴雨范围太小，全球模型无法捕捉。'],
  'Con vigías río arriba': ['With upstream watchers', '加上上游观察员'],
  'del desborde en El Torno.': ['the overflow in El Torno.', '（早于 El Torno 决堤）。'],
  'Fuentes:': ['Sources:', '来源：'],
  // éxito
  'Todos a salvo': ['Everyone safe', '全员安全'],
  'Todos a salvo.': ['Everyone is safe.', '全员安全。'],
  'personas confirmadas': ['people confirmed', '人已确认'],
  'de margen promedio antes del agua': ['average margin before the water', '洪水到达前的平均余量'],
  'para las familias': ['for families', '家庭费用'],
  'Cuando el río suena, el barrio responde.': ['When the river roars, the neighborhood responds.', '河水作响，邻里相应。'],
  'Ver el mapa': ['See the map', '查看地图'],
  // guardián
  'Deja esta pantalla abierta. Si el río suena, este celular va a sonar y vibrar.':
    ['Keep this screen open. If the river roars, this phone will ring and vibrate.', '请保持此页面打开。河水作响时，这部手机会响铃并振动。'],
  'Activar avisos': ['Turn on alerts', '开启提醒'],
  'Avisos activados ✓': ['Alerts on ✓', '提醒已开启 ✓'],
  '¡El río suena!': ['The river is roaring!', '河水在作响！'],
  'Ayuda a': ['Help', '请帮助'],
  'El agua llega en': ['Water arrives in', '洪水到达还有'],
  'Punto seguro: la loma de la plaza principal': ['Safe point: the hill by the main square', '安全点：主广场旁的高地'],
  'Ya la ayudé ✓': ['I helped her ✓', '我已帮她撤离 ✓'],
  'El río ahora': ['The river now', '河流现状'],
  'sin datos': ['no data', '无数据'],
  'Esperando la lectura del vigía central…': ['Waiting for the central watch reading…', '正在等待中心监测读数…'],
  'm³/s caudal': ['m³/s discharge', 'm³/s 流量'],
  'mm lluvia 24 h': ['mm rain 24 h', '毫米 24小时降雨'],
  'riesgo /100': ['risk /100', '风险 /100'],
  'Escuchando al río': ['Listening to the river', '正在监听河流'],
  'Probar sonido': ['Test sound', '测试声音'],
  'Ve ahora a su casa': ['Go to their home now', '立即前往其家中'],
  'Llévala a la loma de la plaza principal': ['Take them to the hill by the main square', '带其前往主广场旁的高地'],
  'Cuando esté a salvo, toca el botón verde': ['When they are safe, tap the green button', '确认安全后，点击绿色按钮'],
  'Por dónde viene el agua': ['Where the water comes from', '洪水从哪里来'],
  'Lluvia río arriba': ['Rain upstream', '上游降雨'],
  'punto de control': ['checkpoint', '监测点'],
  'El río y tu barrio': ['The river and your neighborhood', '河流与你的社区'],
  'Tu barrio': ['Your neighborhood', '你的社区'],
  'Datos abiertos de la cuenca alta · Open-Meteo y GloFAS': ['Open data from the upper basin · Open-Meteo and GloFAS', '上游流域开放数据 · Open-Meteo 和 GloFAS'],
  'Para que este celular suene con la alerta de tu comunidad, escanea el código QR de tu junta vecinal.': ['To make this phone ring with your community alert, scan your neighborhood council QR code.', '要让这部手机响起社区警报，请扫描你所在居委会的二维码。'],
  'Instalar como app': ['Install as app', '安装为应用'],
  'Que suene con el celular bloqueado': ['Ring even when the phone is locked', '手机锁屏时也响铃'],
  'Para instalarla: botón Compartir y luego «Agregar a inicio».': ['To install: tap Share, then «Add to Home Screen».', '安装方法：点“分享”，再点“添加到主屏幕”。'],
  'Bajar ntfy': ['Get ntfy', '下载 ntfy'],
  'ascensos': ['rising', '上涨'], 'descensos': ['falling', '下降'], 'poco variable': ['steady', '基本稳定'],
  'boletín': ['bulletin', '公报'], 'aviso rojo de SENAMHI': ['SENAMHI red alert', 'SENAMHI 红色预警'],
  'Falsa alarma': ['False alarm', '误报'],
  'Alerta cancelada': ['Alert cancelled', '警报已取消'],
  'Falsa alarma: la junta verificó el río y está normal. Gracias por estar atentos.': ['False alarm: the neighborhood council checked the river and it is normal. Thank you for staying alert.', '误报：居委会已核实河流，一切正常。感谢大家保持警惕。'],
  'Volver': ['Back', '返回'],
  'Solo quiero ver el río': ['I just want to watch the river', '我只想看看河流'],
  'Quiero ser ayudante de alguien': ['I want to be someone’s helper', '我想成为某人的帮手'],
  'Avisa a tu familia y vecinos': ['Warn your family and neighbors', '通知家人和邻居'],
  'Sube a la loma de la plaza principal': ['Go up to the hill by the main square', '前往主广场旁的高地'],
  'Ayuda a quien no pueda caminar': ['Help anyone who can’t walk', '帮助行动不便的人'],
  'El agua viene río abajo hacia': ['The water is coming downstream toward', '洪水正沿河而下，流向'],
  'llegó el agua': ['water arrived', '洪水已到'],
  'Crecida del Piraí': ['Piraí flood', '皮拉伊河涨水'],
  '¡Gracias!': ['Thank you!', '谢谢！'],
  'Confirmado desde la central.': ['Confirmed from the control room.', '已由指挥中心确认。'],
  'Falta el código': ['Missing code', '缺少代码'],
  'Abre este enlace desde el QR de la central.': ['Open this link from the control room’s QR code.', '请通过指挥中心的二维码打开此链接。'],
  // atributos
  'Lluvia real río arriba': ['Real rain upstream', '上游实际降雨'],
  'Escanea y recibe la alerta en tu celular': ['Scan and get the alert on your phone', '扫码即可在手机上接收警报'],
  'Leer el aviso en voz alta': ['Read the alert aloud', '朗读警报'],
  'Letra grande y alto contraste': ['Large text and high contrast', '大字与高对比度'],
  'Un vecino de la ribera reporta que el río creció (solo sube el índice)': ['A riverside neighbor reports the river rose (only raises the index)', '河岸邻居报告涨水（只会提高指数）'],
  'Un vigía río arriba (Bermejo, río Espejos) reporta que el río creció: con 2 vigías hay alerta': ['An upstream watcher (Bermejo, Espejos river) reports the river rose: 2 watchers trigger the alert', '上游观察员（Bermejo、Espejos 河）报告涨水：2 人报告即触发警报'],
  'Foto de la regla pintada: se lee el nivel con 3 toques': ['Photo of the painted gauge: read the level with 3 taps', '水尺照片：点击 3 次读取水位'],
  'Mapa del río Piraí': ['Map of the Piraí river', '皮拉伊河地图'],
  'Espectrograma del sonido del río': ['Spectrogram of the river’s sound', '河流声音频谱图'],
  'Lluvia por hora y riesgo calculado la noche del 12 al 13 de diciembre de 2025': ['Hourly rain and computed risk on the night of 12–13 December 2025', '2025 年 12 月 12 日至 13 日夜间每小时降雨与计算风险'],
  'Idioma': ['Language', '语言'],
  // datos de la demo
  'Niños Gutiérrez (3)': ['Gutiérrez children (3)', 'Gutiérrez 家的孩子（3 人）'],
  'Marcelo (vecino)': ['Marcelo (neighbor)', 'Marcelo（邻居）'],
  'Lucía (vecina)': ['Lucía (neighbor)', 'Lucía（邻居）'],
  'Rubén (vecino)': ['Rubén (neighbor)', 'Rubén（邻居）'],
  'Profe Ana': ['Ana (teacher)', 'Ana 老师'],
  'Porongo (ribera)': ['Porongo (riverside)', 'Porongo（河岸）'],
  // vigía desde el celular o por Telegram
  'Segundo vigía: se lanza la alerta': ['Second watcher: the alert goes out', '第二名观察员：发出警报'],
  'Falta un segundo vigía para lanzar la alerta': ['One more watcher is needed to send the alert', '还需要一名观察员才能发出警报'],
  'Sé vigía río arriba': ['Be an upstream watcher', '成为上游观察员'],
  'QR vigía': ['Watcher QR', '观察员二维码'],
  'Escanea con otro celular para reportar como vigía río arriba': ['Scan with another phone to report as an upstream watcher', '用另一部手机扫码，以上游观察员身份报告'],
  'río arriba': ['upstream', '上游'],
  'silla de ruedas': ['wheelchair user', '使用轮椅'],
  'no oye: aviso en señas': ['deaf: alert in sign language', '听障：手语通知'],
  'solos hasta las 19:00': ['home alone until 7 pm', '独自在家至 19:00'],
  'habla quechua': ['speaks Quechua', '说克丘亚语'],
  // fuentes de datos
  'respaldo (sin internet)': ['offline fallback', '离线备用数据'],
  'Open-Meteo + GloFAS, en vivo': ['Open-Meteo + GloFAS, live', 'Open-Meteo + GloFAS，实时'],
  'vigía central (PC del equipo)': ['central watcher (team PC)', '中央守望（团队电脑）'],
  'datos abiertos de la cuenca alta': ['open data from the upper basin', '上游流域开放数据'],
  'dos vigías río arriba': ['two upstream watchers', '两名上游观察员'],
  'el oído del río': ['the river ear', '河之耳'],
  'la foto de la regla': ['the gauge photo', '水尺照片'],
};

// ---------- textos con números o nombres ----------
const lista = (s, l) => s.split(', ').map(x => t(x, l)).join(l === 'zh' ? '、' : ', ');
const n = (s, l) => l === 'es' ? s : s.replace(/(\d),(\d)/g, '$1.$2'); // 1,2 m → 1.2 m
const NIVEL_OF = { 'sin amenaza': ['no threat', '无威胁'], amarilla: ['yellow alert', '黄色预警'], naranja: ['orange alert', '橙色预警'], roja: ['red alert', '红色预警'] };
const DIA_OF = { lunes: ['Monday', '周一'], martes: ['Tuesday', '周二'], 'miércoles': ['Wednesday', '周三'], jueves: ['Thursday', '周四'], viernes: ['Friday', '周五'], 'sábado': ['Saturday', '周六'], domingo: ['Sunday', '周日'] };
const P = [
  // aviso oficial de SENAMHI (js/senamhi.js → textoOficial)
  [/^SENAMHI hoy: amenaza (sin amenaza|amarilla|naranja|roja)$/, (l, m) => l === 'zh' ? `SENAMHI 今日：${NIVEL_OF[m[1]][1]}` : `SENAMHI today: ${NIVEL_OF[m[1]][0]}`],
  [/^sube a (amarilla|naranja|roja) el (\S+) (\d+)$/, (l, m) => l === 'zh' ? `${m[3]} 日（${DIA_OF[m[2]]?.[1] || m[2]}）升至${NIVEL_OF[m[1]][1]}` : `rises to ${NIVEL_OF[m[1]][0]} on ${DIA_OF[m[2]]?.[0] || m[2]} ${m[3]}`],
  [/^Vigilancia por el aviso oficial: SENAMHI prevé amenaza (amarilla|naranja|roja) en la cuenca del Piraí\. Revisen la regla y tengan lista la mochila\.$/, (l, m) => l === 'zh'
    ? `因官方预警而警戒：SENAMHI 预报皮拉伊河流域${NIVEL_OF[m[1]][1]}。请查看水位标尺，备好应急背包。` : `On watch because of the official warning: SENAMHI forecasts ${NIVEL_OF[m[1]][0]} for the Piraí basin. Check the gauge and have your go-bag ready.`],
  [/^(\d+) h (\d+) min$/, (l, m) => l === 'zh' ? `${m[1]} 小时 ${m[2]} 分` : m[0]],
  [/^(\d+) min$/, (l, m) => l === 'zh' ? `${m[1]} 分钟` : m[0]],
  [/^(\d+) horas? (\d+) minutos?$/, (l, m) => l === 'zh' ? `${m[1]} 小时 ${m[2]} 分钟` : `${m[1]} hours ${m[2]} minutes`],
  [/^(\d+) minutos?$/, (l, m) => l === 'zh' ? `${m[1]} 分钟` : `${m[1]} minutes`],
  [/^([\d,]+) m$/, (l, m) => l === 'zh' ? `${n(m[1], l)} 米` : `${n(m[1], l)} m`],
  [/^agua ([\d,]+) m$/, (l, m) => l === 'zh' ? `水深 ${n(m[1], l)} 米` : `water ${n(m[1], l)} m`],
  [/^([\d.]+) km río abajo de La Angostura$/, (l, m) => l === 'zh' ? `La Angostura 下游 ${m[1]} 公里` : `${m[1]} km downstream of La Angostura`],
  [/^([\d.]+) km · hasta ([\d,]+) m de agua$/, (l, m) => l === 'zh' ? `${m[1]} 公里 · 水深最高 ${n(m[2], l)} 米` : `${m[1]} km · up to ${n(m[2], l)} m of water`],
  [/^(\d+) reportes?$/, (l, m) => l === 'zh' ? `${m[1]} 条报告` : `${m[1]} report${m[1] === '1' ? '' : 's'}`],
  [/^(\d+) reporte · Bermejo: «baja turbio»$/, (l, m) => l === 'zh' ? `${m[1]} 条报告 · Bermejo：「河水浑浊」` : `${m[1]} report · Bermejo: “muddy water coming down”`],
  [/^(\d+) vigías? río arriba: «el río creció»$/, (l, m) => l === 'zh' ? `${m[1]} 名上游观察员：「河水涨了」` : `${m[1]} upstream watcher${m[1] === '1' ? '' : 's'}: “the river rose”`],
  [/^([\d,]+) mm 6 h · ([\d,]+) próx\.$/, (l, m) => l === 'zh' ? `6 小时 ${n(m[1], l)} 毫米 · 预计 ${n(m[2], l)}` : `${n(m[1], l)} mm 6 h · ${n(m[2], l)} next`],
  [/^([\d,]+) m³\/s \(p95 (\d+)\)$/, (l, m) => `${n(m[1], l)} m³/s (p95 ${m[2]})`],
  [/^Cuenca alta: (\d+) mm \(24 h\) · (\d+) mm próx\.$/, (l, m) => l === 'zh' ? `上游流域：${m[1]} 毫米（24 小时）· 预计 ${m[2]} 毫米` : `Upper basin: ${m[1]} mm (24 h) · ${m[2]} mm next`],
  [/^Fuente: ([^·]+?)( · .*)?$/, (l, m) => (l === 'zh' ? '来源：' : 'Source: ') + t(m[1], l) + (m[2] || '')],
  [/^Datos abiertos de la cuenca alta · (.+) · sin hardware$/, (l, m) => l === 'zh' ? `上游流域开放数据 · ${t(m[1], l)} · 无需硬件` : `Open data from the upper basin · ${t(m[1], l)} · no hardware`],
  [/^Alerta por (.+?)\. Intensidad ([\d.]+) de 4\.(?: La crecida llegaría a La Angostura en (.+)\.)?$/, (l, m) => l === 'zh'
    ? `${t(m[1], l)}触发警报。强度 ${m[2]}/4。` + (m[3] ? `洪水将在 ${t(m[3], l)}后到达 La Angostura。` : '')
    : `Alert from ${t(m[1], l)}. Intensity ${m[2]} of 4.` + (m[3] ? ` The flood would reach La Angostura in ${t(m[3], l)}.` : '')],
  [/^(.+) \(escenario del simulacro; lluvia real hoy: (\S+) mm\)$/, (l, m) => t(m[1], l) + (l === 'zh' ? `（演练情景；今天实际降雨：${m[2]} 毫米）` : ` (drill scenario; real rain today: ${m[2]} mm)`)],
  [/^(.+) · Regla pintada: ([\d,]+) m \(foto de vecino\)$/, (l, m) => t(m[1], l) + (l === 'zh' ? ` · 水尺读数：${n(m[2], l)} 米（邻居拍摄）` : ` · Painted gauge: ${n(m[2], l)} m (neighbor’s photo)`)],
  [/^Confirmado: (\d+) mm de lluvia río arriba en 24 h$/, (l, m) => l === 'zh' ? `已确认：上游 24 小时降雨 ${m[1]} 毫米` : `Confirmed: ${m[1]} mm of rain upstream in 24 h`],
  [/^Lluvia moderada río arriba \((\d+) mm\)\. Pedimos foto de la regla\.$/, (l, m) => l === 'zh' ? `上游降雨中等（${m[1]} 毫米）。请拍摄水尺照片。` : `Moderate rain upstream (${m[1]} mm). We ask for a gauge photo.`],
  [/^Casi sin lluvia río arriba \((\d+) mm\): posible falsa alarma, se pide confirmar con foto\.$/, (l, m) => l === 'zh' ? `上游几乎没有降雨（${m[1]} 毫米）：可能是误报，请用照片确认。` : `Almost no rain upstream (${m[1]} mm): possible false alarm, please confirm with a photo.`],
  [/^(\d+) personas que no podían salir solas ya están en el punto seguro \((.+)\), antes de que llegue el agua\.$/, (l, m) => l === 'zh'
    ? `${m[1]} 位无法独自撤离的人已在洪水到达前抵达安全点（${lista(m[2], l)}）。` : `${m[1]} people who couldn’t leave on their own are already at the safe point (${lista(m[2], l)}), before the water arrives.`],
  [/^(\d+) personas · (\d+) pendientes de aprobar · (\d+) a salvo · (\d+) sin confirmar$/, (l, m) => l === 'zh'
    ? `${m[1]} 人 · ${m[2]} 人待审批 · ${m[3]} 人安全 · ${m[4]} 人未确认` : `${m[1]} people · ${m[2]} pending approval · ${m[3]} safe · ${m[4]} unconfirmed`],
  [/^(.+) · ayudante: (.+)$/, (l, m) => `${t(m[1], l)} · ${l === 'zh' ? '帮手：' : 'helper: '}${t(m[2], l)}`],
  [/^(.+): a salvo$/, (l, m) => t(m[1], l) + (l === 'zh' ? '：安全' : ': safe')],
  [/^a salvo · (\d+:\d\d)$/, (l, m) => (l === 'zh' ? '安全 · ' : 'safe · ') + m[1]],
  [/^evacuado · (\d+:\d\d)$/, (l, m) => (l === 'zh' ? '已撤离 · ' : 'evacuated · ') + m[1]],
  [/^(.+): evacuado$/, (l, m) => t(m[1], l) + (l === 'zh' ? '：已撤离' : ': evacuated')],
  [/^evacuación confirmada en la central · (\d+:\d\d) tras el aviso$/, (l, m) => l === 'zh' ? `已在指挥中心确认撤离 · 预警后 ${m[1]}` : `evacuation confirmed at the control room · ${m[1]} after the alert`],
  [/^(.+) confirmó desde su celular · (\d+:\d\d) tras el aviso$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 已用手机确认 · 预警后 ${m[2]}` : `${t(m[1], l)} confirmed from their phone · ${m[2]} after the alert`],
  [/^confirmado en la central · (\d+:\d\d) tras el aviso$/, (l, m) => l === 'zh' ? `已在指挥中心确认 · 预警后 ${m[1]}` : `confirmed at the control room · ${m[1]} after the alert`],
  [/^(.+) está a salvo\. La central ya lo sabe\.$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 已安全。指挥中心已收到。` : `${t(m[1], l)} is safe. The control room knows.`],
  [/^(.+) está a salvo\.?$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 已安全。` : `${t(m[1], l)} ${/children/.test(t(m[1], l)) ? 'are' : 'is'} safe.`],
  [/^Vigía central · hace (\d+) min$/, (l, m) => l === 'zh' ? `中心监测 · ${m[1]} 分钟前` : `Central watch · ${m[1]} min ago`],
  [/^(.+) si crece$/, (l, m) => l === 'zh' ? `若涨水 ${t(m[1], l)}` : `${t(m[1], l)} if it rises`],
  [/^Eres ayudante de (.+)$/, (l, m) => l === 'zh' ? `你是 ${t(m[1], l)} 的帮手` : `You are ${t(m[1], l)}’s helper`],
  [/^Sé ayudante de (.+)$/, (l, m) => l === 'zh' ? `成为 ${t(m[1], l)} 的帮手` : `Be ${t(m[1], l)}’s helper`],
  // hermanos de ejemplo con apellido sorteado: «Niños Vargas (3)»
  [/^Niños (\S+) \((\d+)\)$/, (l, m) => l === 'zh' ? `${m[1]} 家的孩子（${m[2]} 人）` : `${m[1]} children (${m[2]})`],
  [/^Familia (\S+)$/, (l, m) => l === 'zh' ? `${m[1]} 一家` : `${m[1]} family`],
  // ayudantes sorteados: «Paola (vecina)», «Profe Javier»
  [/^(\S+) \((vecino|vecina)\)$/, (l, m) => l === 'zh' ? `${m[1]}（邻居）` : `${m[1]} (neighbor)`],
  [/^Profe (\S+)$/, (l, m) => l === 'zh' ? `${m[1]} 老师` : `${m[1]} (teacher)`],
  [/^Rugido ([\d.]+)× más fuerte que lo normal: piedras en movimiento…$/, (l, m) => l === 'zh' ? `轰鸣比平时强 ${m[1]} 倍：石块正在滚动…` : `Rumble ${m[1]}× louder than normal: stones on the move…`],
  [/^Aquí llegaría el agua: ([\d,]+) m$/, (l, m) => l === 'zh' ? `水会涨到这里：${n(m[1], l)} 米` : `The water would reach here: ${n(m[1], l)} m`],
  [/^Toca la marca de (\d+) m$/, (l, m) => l === 'zh' ? `点击 ${m[1]} 米刻度` : `Tap the ${m[1]} m mark`],
  [/^Nivel leído: ([\d,]+) m\. Reporte enviado\.$/, (l, m) => l === 'zh' ? `读取水位：${n(m[1], l)} 米。报告已发送。` : `Level read: ${n(m[1], l)} m. Report sent.`],
  [/^(.+) quedó guardado en este celular\. Enviando a la junta…$/, (l, m) => l === 'zh' ? `${m[1]} 已保存在本机。正在发送给委员会…` : `${m[1]} was saved on this phone. Sending to the board…`],
  [/^✓ (.+) llegó al registro de la junta vecinal\. Cuando lo aprueben, su ayudante recibe las alertas\.$/, (l, m) => l === 'zh' ? `✓ ${m[1]} 已进入社区委员会名册。审批后，其帮手会收到警报。` : `✓ ${m[1]} reached the neighborhood board’s register. Once approved, the helper gets the alerts.`],
  [/^(.+) quedó guardado en este celular; se envía a la junta apenas haya internet\.$/, (l, m) => l === 'zh' ? `${m[1]} 已保存在本机；联网后会发送给委员会。` : `${m[1]} was saved on this phone; it will be sent to the board as soon as there is internet.`],
  [/^Registro compartido · comunidad «(.+)» · (\d+) registradas · al día$/, (l, m) => l === 'zh' ? `共享名册 · 社区「${m[1]}」· 已登记 ${m[2]} 人 · 已同步` : `Shared register · community “${m[1]}” · ${m[2]} registered · up to date`],
  [/^Comunidad «(.+)»: escribe la clave de la junta para ver el registro compartido\.$/, (l, m) => l === 'zh' ? `社区「${m[1]}」：输入委员会密钥以查看共享名册。` : `Community “${m[1]}”: enter the board key to see the shared register.`],
  [/^Sin conexión con el registro compartido \((.+)\)\. Se muestra la última copia\.$/, (l, m) => l === 'zh' ? `无法连接共享名册（${m[1]}）。显示最近一次副本。` : `No connection to the shared register (${m[1]}). Showing the last copy.`],
  [/^No se pudo: (.+)$/, (l, m) => (l === 'zh' ? '操作失败：' : 'Failed: ') + m[1]],
  [/^Vigía en (.+): «el río creció»$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 的观察员：「河水涨了」` : `Watcher in ${t(m[1], l)}: “the river rose”`],
  [/^(\d+) vigías? río arriba: «el río creció» \(último: (.+)\)$/, (l, m) => l === 'zh' ? `${m[1]} 名上游观察员：「河水涨了」（最近：${t(m[2], l)}）` : `${m[1]} upstream watcher${m[1] === '1' ? '' : 's'}: “the river rose” (latest: ${t(m[2], l)})`],
  [/^(.+): aviso recibido$/, (l, m) => l === 'zh' ? `${t(m[1], l)}：已收到警报` : `${t(m[1], l)}: alert received`],
  [/^El celular de (.+) sonó · (\d+:\d\d) tras el aviso$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 的手机已响 · 预警后 ${m[2]}` : `${t(m[1], l)}’s phone rang · ${m[2]} after the alert`],
  [/^×(\d+) · \+(.+)$/, (l, m) => `×${m[1]} · +${t(m[2], l)}`],
  [/^Vieron ([\d,]+) mm en 24 h \(máx\. (\d+) mm\/h\)\. Riesgo máximo (\d+)\/100:$/, (l, m) => l === 'zh' ? `模型看到 24 小时 ${n(m[1], l)} 毫米（最大 ${m[2]} 毫米/小时）。最高风险 ${m[3]}/100：` : `They saw ${n(m[1], l)} mm in 24 h (max. ${m[2]} mm/h). Maximum risk ${m[3]}/100:`],
  [/^Dos vecinos de Bermejo o del río Espejos reportan «el río creció» → alerta a las (\d+:\d+):$/, (l, m) => l === 'zh' ? `Bermejo 或 Espejos 河的两位邻居报告「河水涨了」→ ${m[1]} 发出警报：` : `Two neighbors in Bermejo or on the Espejos river report “the river rose” → alert at ${m[1]}:`],
  [/^(.+) antes$/, (l, m) => l === 'zh' ? `提前 ${t(m[1], l)}` : `${m[1]} before`],
  [/^Lluvia: Open-Meteo Historical Forecast \(best_match\), 5 puntos de la cuenca alta\. Caudal: GloFAS, que tampoco subió \((.+) m³\/s\)\. La hora del reporte de los vigías es hipotética: sale del tiempo que tarda la crecida en bajar \(modelo de la app, caso rápido\)\.$/,
    (l, m) => l === 'zh' ? `降雨：Open-Meteo Historical Forecast（best_match），上游流域 5 个点。流量：GloFAS，同样没有上升（${n(m[1], l)} m³/s）。观察员报告的时间是假设的：根据洪水下行所需时间推算（应用模型，快速情形）。`
      : `Rain: Open-Meteo Historical Forecast (best_match), 5 points in the upper basin. Discharge: GloFAS, which did not rise either (${n(m[1], l)} m³/s). The watchers’ report time is hypothetical: it comes from the time the flood takes to travel down (app model, fast case).`],
  [/^Atención\. Lluvia fuerte en la cuenca alta del Piraí\. La crecida llegaría a La Angostura en (.+) y a El Torno en (.+)\.$/, (l, m) => l === 'zh'
    ? `注意。皮拉伊河上游流域降雨强烈。洪水将在 ${t(m[1], l)}后到达 La Angostura，${t(m[2], l)}后到达 El Torno。` : `Attention. Heavy rain in the upper Piraí basin. The flood would reach La Angostura in ${t(m[1], l)} and El Torno in ${t(m[2], l)}.`],
  [/^Atención\. El río suena\. Crecida detectada en La Angostura\. El agua llegaría a El Torno en (.+)\.$/, (l, m) => l === 'zh'
    ? `注意。河水在作响。La Angostura 检测到洪水。洪水将在 ${t(m[1], l)}后到达 El Torno。` : `Attention. The river is roaring. Flood detected at La Angostura. The water would reach El Torno in ${t(m[1], l)}.`],
  [/^\((.+)\)$/, (l, m) => (l === 'zh' ? '（' : '(') + t(m[1], l) + (l === 'zh' ? '）' : ')')],
  [/^(.+), Cuadra (\d+)$/, (l, m) => l === 'zh' ? `${t(m[1], l)}，第 ${m[2]} 街区` : `${t(m[1], l)}, Block ${m[2]}`],
  [/^Cuadra (\d+)$/, (l, m) => l === 'zh' ? `第 ${m[1]} 街区` : `Block ${m[1]}`],
];

const cache = { en: new Map(), zh: new Map() };
/** Traduce un texto en castellano al idioma l ('es' lo deja igual). Si no se conoce, queda en castellano. */
export function t(es, l = actual) {
  if (l === 'es' || !es) return es;
  const c = cache[l]; if (!c) return es;
  if (c.has(es)) return c.get(es);
  const i = l === 'en' ? 0 : 1;
  let r = D[es]?.[i];
  if (r == null) for (const [re, f] of P) { const m = es.match(re); if (m) { r = f(l, m); break; } }
  // frases unidas con « · »: se traduce cada parte
  if (r == null && es.includes(' · ')) { const partes = es.split(' · '); const tr = partes.map(p => t(p, l)); if (tr.some((x, k) => x !== partes[k])) r = tr.join(' · '); }
  if (r == null) r = es;
  if (c.size > 3000) c.clear();
  c.set(es, r); return r;
}

// ---------- aplicar en la página ----------
let actual = 'es';
const origen = new WeakMap(), mostrado = new WeakMap(), attrOrig = new WeakMap();
const ATTRS = ['title', 'aria-label', 'placeholder'];
const omitir = el => !el || el.closest('script,style,[translate="no"],.maplibregl-ctrl-attrib');

function textoNodo(nd) {
  if (omitir(nd.parentElement)) return;
  const d = nd.data;
  if (mostrado.get(nd) !== d) origen.set(nd, d); // la app escribió algo nuevo
  const es = origen.get(nd), s = es.trim();
  if (!s || !/[A-Za-zÁÉÍÓÚáéíóúñ¿¡]/.test(s)) { mostrado.set(nd, d); return; }
  const out = actual === 'es' ? es : es.replace(s, t(s));
  mostrado.set(nd, out);
  if (nd.data !== out) nd.data = out;
}
function atributos(el) {
  if (omitir(el)) return;
  let o = attrOrig.get(el); if (!o) attrOrig.set(el, o = {});
  for (const a of ATTRS) {
    const v = el.getAttribute(a); if (v == null) continue;
    if (o[a] == null || (v !== o[a] && v !== o['_' + a])) o[a] = v; // cambio hecho por la app
    const out = t(o[a]); o['_' + a] = out;
    if (v !== out) el.setAttribute(a, out);
  }
}
function recorrer(raiz) {
  if (raiz.nodeType === 3) return textoNodo(raiz);
  if (raiz.nodeType !== 1) return;
  if (raiz.matches?.('[title],[aria-label],[placeholder]')) atributos(raiz);
  raiz.querySelectorAll?.('[title],[aria-label],[placeholder]').forEach(atributos);
  const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT); let nd;
  while ((nd = w.nextNode())) textoNodo(nd);
}

let obs;
function observar() {
  obs = new MutationObserver(lista => {
    obs.disconnect();
    for (const m of lista) {
      if (m.type === 'characterData') textoNodo(m.target);
      else if (m.type === 'attributes') atributos(m.target);
      else m.addedNodes.forEach(recorrer);
    }
    conectar();
  });
  conectar();
}
const conectar = () => obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });

const avisados = new Set();
export const idiomaActual = () => actual;
export const vozActual = () => IDIOMAS.find(x => x.id === actual).voz;
export function alCambiar(f) { avisados.add(f); }

export function ponerIdioma(id) {
  if (!IDIOMAS.some(x => x.id === id)) id = 'es';
  actual = id;
  document.documentElement.lang = IDIOMAS.find(x => x.id === id).html;
  try { localStorage.setItem(CLAVE, id); } catch {}
  obs?.disconnect(); recorrer(document.body); obs && conectar();
  document.querySelectorAll('[data-idioma]').forEach(b => b.setAttribute('aria-pressed', b.dataset.idioma === id));
  avisados.forEach(f => { try { f(id); } catch {} });
}

/** Arranca: idioma de ?lang=, o el guardado, o el del navegador. Pone el selector en `contenedor`. */
export function iniciarIdioma(contenedor) {
  let id = new URLSearchParams(location.search).get('lang');
  if (!id) { try { id = localStorage.getItem(CLAVE); } catch {} }
  if (!id) id = (navigator.language || 'es').slice(0, 2);
  if (contenedor) {
    const g = document.createElement('div'); g.className = 'idiomas'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Idioma · Language · 语言');
    g.setAttribute('translate', 'no');
    IDIOMAS.forEach(x => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn chico'; b.dataset.idioma = x.id;
      b.textContent = x.corto; b.lang = x.html; b.title = x.nombre; b.setAttribute('aria-pressed', 'false');
      b.onclick = () => ponerIdioma(x.id);
      g.append(b);
    });
    contenedor.append(g);
  }
  observar();
  ponerIdioma(id);
}
