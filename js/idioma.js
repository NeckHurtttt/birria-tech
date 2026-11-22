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
  'Rescate oficial confirmó: evacuado.': ['Official rescue confirmed: evacuated.', '官方救援已确认：已撤离。'],
  'Vayan juntos a la loma de la plaza principal': ['Go together to the hill by the main square', '一起前往主广场旁的高地'],
  'Cuando estén a salvo, toca el botón verde': ['When you are safe, tap the green button', '确认安全后，点击绿色按钮'],
  'Listo, a salvo ✓': ['Done, safe ✓', '完成，已安全 ✓'],
  'pendiente': ['pending', '待审批'],
  'Confirmar desde aquí': ['Confirm from here', '在此确认'],
  'Confirmar evacuación': ['Confirm evacuation', '确认撤离'],
  // chat con el ayudante
  'Chat': ['Chat', '聊天'],
  'Asiste a': ['Helping', '协助'],
  'en camino': ['on the way', '在路上'],
  'Cerrar chat': ['Close chat', '关闭聊天'],
  'Mensaje para el ayudante': ['Message to the helper', '发给帮手的消息'],
  'Escribe un mensaje…': ['Type a message…', '输入消息…'],
  'Enviar': ['Send', '发送'],
  'Sin internet:': ['No internet:', '无网络时：'],
  'Demo: el ayudante responde solo durante el simulacro.': ['Demo: the helper replies automatically during the drill.', '演示：演练中帮手会自动回复。'],
  '¿Ya vas en camino?': ['Are you on your way?', '你在路上了吗？'],
  'Avísame cuando estén a salvo.': ['Let me know when you’re safe.', '安全后告诉我。'],
  'Simular respuesta': ['Simulate reply', '模拟回复'],
  '¡Listo! Ya estamos a salvo.': ['Done! We’re safe now.', '好了！我们已经安全了。'],
  'Ya puedes confirmar la evacuación en la tarjeta.': ['You can now confirm the evacuation on the card.', '现在可以在卡片上确认撤离了。'],
  'Su celular recibió la alerta.': ['Their phone got the alert.', '对方手机已收到警报。'],
  'Confirmó desde su celular: evacuado.': ['Confirmed from their phone: evacuated.', '已用手机确认：已撤离。'],
  'Evacuación confirmada en la central.': ['Evacuation confirmed at the control room.', '已在指挥中心确认撤离。'],
  'Sin confirmación a T−30: pasa al rescate oficial.': ['No confirmation at T−30: handed to official rescue.', 'T−30 仍未确认：转交官方救援。'],
  'Se habilita cuando el ayudante avise en el chat que va en camino y que ya están a salvo': ['Enabled once the helper says in the chat they’re on the way and that they’re safe', '帮手在聊天中告知已出发并已安全后才可点击'],
  'En camino: se habilita cuando el ayudante avise que ya están a salvo': ['On the way: enabled once the helper says they’re safe', '在路上：帮手告知已安全后才可点击'],
  'escribiendo': ['typing', '正在输入'],
  'Mensaje nuevo': ['New message', '新消息'],
  '¡Todos a salvo! Gracias a cada vecino ayudante.': ['Everyone is safe! Thanks to every helper neighbor.', '全员安全！感谢每一位邻居帮手。'],
  'Nuevo': ['New', '新'],
  'Responde en el chat': ['Reply in the chat', '请在聊天中回复'],
  // chat: zona lejos (tono preventivo) y nuevas preguntas de zona cerca
  'Confirmar': ['Confirm', '确认'],
  '¿Ya lograron subir a zona alta?': ['Did you manage to get up to high ground?', '你们上到高处了吗？'],
  'Confírmame en cuanto estén fuera de peligro.': ['Confirm as soon as you’re out of danger.', '一脱离危险就向我确认。'],
  '¿Cómo está el nivel del agua en esa cuadra?': ['How high is the water on that block?', '那个街区的水位怎么样？'],
  '¿Ya recibiste el aviso? Hay margen, pero conviene salir con tiempo.': ['Did you get the alert? There’s time, but it’s best to leave early.', '收到警报了吗？还有时间，但最好提前出发。'],
  '¿Ya están alistando sus cosas con calma?': ['Are you calmly getting your things ready?', '你们在从容地收拾东西了吗？'],
  '¿Ya tienen listos documentos y medicinas?': ['Do you have documents and medicines ready?', '证件和药品都准备好了吗？'],
  '¿Van a salir de manera preventiva antes de que baje el agua?': ['Are you leaving as a precaution before the water comes down?', '你们会在洪水下来之前预防性撤离吗？'],
  '¿Prefieren adelantarse y salir con tiempo?': ['Would you rather get ahead and leave early?', '你们愿意提前出发吗？'],
  '¿Cómo está el ánimo y la organización por allá?': ['How are morale and organization over there?', '那边大家情绪和组织情况怎么样？'],
  '¿Cómo están los vecinos por allá, tranquilos?': ['How are the neighbors over there, calm?', '那边的邻居们还平静吗？'],
  'Avísame cuando ya estén ubicados en un lugar seguro.': ['Tell me once you’re settled somewhere safe.', '到了安全地点安顿好后告诉我。'],
  '¿Ya saben a qué lugar seguro van a ir?': ['Do you know which safe place you’re going to?', '你们知道要去哪个安全地点吗？'],
  '¿Por allá ya se ve subir el río?': ['Can you see the river rising over there yet?', '那边已经能看到河水上涨了吗？'],
  '¿La ruta de evacuación sigue despejada?': ['Is the evacuation route still clear?', '撤离路线还畅通吗？'],
  'Por aquí aún no llega el agua, estamos organizando todo con tiempo para salir sin apuros.': ['The water hasn’t reached us yet; we’re organizing everything in good time to leave without rushing.', '水还没到我们这里，我们正提前安排好一切，从容撤离。'],
  'Ya salimos de manera preventiva hacia zona segura; todavía falta tiempo aquí pero preferimos adelantarnos.': ['We already left as a precaution for a safe area; there’s still time here but we’d rather get ahead.', '我们已经预防性地前往安全区；这里还有时间，但我们宁愿提前。'],
  'Sí, ya tenemos documentos, medicinas y una mochila con lo necesario. Salimos con calma y ya estamos en lugar seguro.': ['Yes, we have documents, medicines and a backpack with the essentials. We left calmly and we’re somewhere safe now.', '是的，证件、药品和装着必需品的背包都带上了。我们从容出发，现在已经在安全的地方。'],
  'Alistamos lo importante sin apuro y ya nos movimos; estamos ubicados en zona segura.': ['We got the important things ready without rushing and moved; we’re settled in a safe area.', '我们不慌不忙地收拾好重要物品并已转移；现在在安全区。'],
  'Sí, salimos de manera preventiva; todavía falta para que llegue el agua, pero ya estamos en zona segura.': ['Yes, we left as a precaution; the water is still a while away, but we’re already in a safe area.', '是的，我们预防性地撤离了；洪水还要一段时间才到，但我们已经在安全区。'],
  'El ánimo está bien, los vecinos se organizaron rápido. Ya estamos todos ubicados en lugar seguro.': ['Morale is good, the neighbors organized quickly. We’re all settled somewhere safe.', '大家情绪不错，邻居们很快组织起来了。我们都已在安全的地方。'],
  'Todo ordenado por aquí: la gente salió tranquila y ya estamos en el punto de encuentro, a salvo.': ['All in order here: people left calmly and we’re at the meeting point, safe.', '这里一切有序：大家平静地撤离，我们已在集合点，安全了。'],
  'Ya llegamos al punto de encuentro, en zona alta. Todo tranquilo, quedamos atentos.': ['We reached the meeting point, on high ground. All calm, we’re staying alert.', '我们到了高处的集合点。一切平静，我们会保持警惕。'],
  'Por aquí el agua todavía no llega; el río se ve crecido a lo lejos. Ya estamos en zona segura por precaución.': ['The water hasn’t reached here yet; the river looks high in the distance. We’re in a safe area as a precaution.', '这里还没有进水；远处的河水看起来涨了。我们已预防性地待在安全区。'],
  'Todavía no sube por esta zona, pero no quisimos esperar: ya estamos a salvo en lo alto.': ['It isn’t rising here yet, but we didn’t want to wait: we’re safe up high.', '这里还没涨水，但我们不想等：已经在高处安全了。'],
  'Las calles siguen libres; salimos sin problema por la ruta de evacuación y ya estamos a salvo.': ['The streets are still clear; we left easily by the evacuation route and we’re safe now.', '街道仍然畅通；我们顺利沿撤离路线出来了，现在安全了。'],
  'Listo, ya estamos en lugar seguro, con calma; aquí todavía hay margen.': ['Done, we’re somewhere safe, calmly; there’s still time here.', '好了，我们已从容到达安全地点；这里还有时间。'],
  'Central, ¿me copian? Todo tranquilo por aquí, solo espero indicaciones.': ['Control room, do you copy? All calm here, just waiting for instructions.', '指挥中心收到吗？这里一切平静，只等指示。'],
  '¿Siguen ahí, central? Por esta zona el agua aún no llega, quedo atento.': ['Are you still there, control room? The water hasn’t reached this area yet, I’m standing by.', '指挥中心还在吗？这片区域还没进水，我随时待命。'],
  'Central, ¿me confirman recibido? Ya estamos ubicados, sin apuro, pero quiero dejarlo registrado.': ['Control room, can you confirm? We’re settled, no rush, but I want it on record.', '指挥中心能确认收到吗？我们已安顿好，不着急，但想登记一下。'],
  '¿Nos registraron como evacuados? Aquí todo en orden, solo falta su confirmación.': ['Did you register us as evacuated? All in order here, just missing your confirmation.', '我们登记为已撤离了吗？这里一切正常，只差你们确认。'],
  // chat: sugerencias y respuestas por tema (js/chat-textos.js)
  '¿Ya sabes por dónde entrar a la cuadra?': ['Do you know how to get into the block?', '你知道从哪里进入街区吗？'],
  '¿Cómo está el nivel del agua en la cuadra?': ['How high is the water on the block?', '街区的水位怎么样？'],
  '¿Hasta dónde llega el agua donde están?': ['How high is the water where you are?', '你们那里水有多深？'],
  '¿Ya subieron al punto alto?': ['Have you gone up to high ground?', '你们上到高处了吗？'],
  'Avísame en cuanto lleguen a lugar seguro.': ['Tell me as soon as you reach a safe place.', '一到安全地点就告诉我。'],
  '¿El paso sigue libre para salir?': ['Is the way out still clear?', '出去的路还通吗？'],
  '¿Pudieron cruzar o el puente ya está tapado?': ['Could you cross, or is the bridge already flooded?', '你们过去了吗，还是桥已经被淹了？'],
  '¿Tienen salida por la calle de arriba?': ['Can you get out through the upper street?', '能从上面那条街出去吗？'],
  '¿Pudieron mover la silla de ruedas?': ['Were you able to move the wheelchair?', '轮椅搬得动吗？'],
  '¿Los chicos están con ustedes?': ['Are the kids with you?', '孩子们和你们在一起吗？'],
  'El nivel subió como medio metro en minutos; alcanzamos a salir. Ya estamos fuera del agua.': ['The level rose about half a meter in minutes; we just made it out. We’re out of the water now.', '水位几分钟就涨了半米左右；我们及时出来了。现在已经离开水了。'],
  'En la cuadra el agua corre fuerte y arrastra ramas. Nosotros ya estamos a salvo, lejos de la orilla.': ['On the block the water runs hard and drags branches. We’re safe now, away from the bank.', '街区的水流很急，还卷着树枝。我们已经安全了，远离河岸。'],
  'Ya estamos arriba, en la loma. Abajo el agua sigue subiendo, pero aquí estamos a salvo.': ['We’re up on the hill. Down below the water keeps rising, but we’re safe here.', '我们已经在高坡上了。下面的水还在涨，但这里很安全。'],
  'Llegamos a la escuela, que es zona alta. Estamos resguardados, el agua no llega hasta acá.': ['We made it to the school, it’s high ground. We’re sheltered, the water doesn’t reach here.', '我们到了学校，那是高处。我们有遮蔽，水淹不到这里。'],
  'El puente de la esquina ya está tapado; salimos por la calle de arriba. Ya estamos a salvo.': ['The bridge at the corner is already flooded; we went out through the upper street. We’re safe now.', '街角的桥已经被淹了；我们从上面那条街出来了。现在安全了。'],
  'La salida principal ya no sirve, el agua la tapó; dimos la vuelta por la cancha y ya estamos a salvo.': ['The main way out is gone, the water covered it; we went around by the sports field and we’re safe now.', '主要出口已经不能走了，被水淹了；我们绕过球场，现在安全了。'],
  'Tengo a toda la familia conmigo, asustados pero bien. Ya estamos a salvo en la escuela.': ['I have the whole family with me, scared but fine. We’re safe at the school now.', '全家人都和我在一起，受了惊吓但都还好。我们已经在学校安全了。'],
  'Los tengo a todos conmigo, asustados pero bien. Ya estamos a salvo en la escuela.': ['I have all of them with me, scared but fine. We’re safe at the school now.', '他们都和我在一起，受了惊吓但都还好。我们已经在学校安全了。'],
  'Responde al ayudante para que confirme…': ['Reply to the helper so they can confirm…', '回复帮手，以便对方确认…'],
  'Esperando la confirmación del ayudante…': ['Waiting for the helper’s confirmation…', '正在等待帮手确认…'],
  '¿Ya saliste para allá?': ['Have you left yet?', '你出发了吗？'],
  'Avísame apenas llegues.': ['Tell me as soon as you get there.', '一到就告诉我。'],
  '¿Ya lograron llegar a zona alta?': ['Did you make it to high ground?', '你们到高处了吗？'],
  'Confírmame por favor si ya están fuera de peligro.': ['Please confirm whether you’re out of danger.', '请确认你们是否已脱离危险。'],
  '¿Cómo está la calle por ahí? Avísame cuando estén a salvo.': ['How’s the street over there? Tell me when you’re safe.', '那边街道情况如何？安全后告诉我。'],
  'Reporta en cuanto estén resguardados.': ['Report as soon as you’re sheltered.', '一到安全地点就报告。'],
  '¿Necesitan apoyo o ya están fuera del agua?': ['Do you need support, or are you out of the water?', '需要支援吗，还是已经离开水了？'],
  '¿Ya están a salvo?': ['Are you safe yet?', '你们安全了吗？'],
  'Responde en el chat y espera la confirmación del ayudante.': ['Reply in the chat and wait for the helper’s confirmation.', '请在聊天中回复，并等待帮手确认。'],
  'Responde en el chat y espera la confirmación del ayudante': ['Reply in the chat and wait for the helper’s confirmation', '请在聊天中回复，并等待帮手确认'],
  'Mensaje enviado: espera la confirmación del ayudante.': ['Message sent: wait for the helper’s confirmation.', '消息已发送：请等待帮手确认。'],
  'El ayudante confirmó que están a salvo.': ['The helper confirmed they’re safe.', '帮手已确认他们安全了。'],
  'El ayudante confirmó: ya puedes confirmar la evacuación.': ['The helper confirmed: you can now confirm the evacuation.', '帮手已确认：现在可以确认撤离了。'],
  '¡Listo! Ya estamos a salvo en la loma, el agua ya tapó la calle.': ['Done! We’re safe on the hill, the water has already covered the street.', '好了！我们已在高坡上安全了，水已经淹没了街道。'],
  '¡A salvo! Llegamos a la plaza; atrás el río ya se llevó la vereda.': ['Safe! We made it to the square; behind us the river already took the sidewalk.', '安全了！我们到了广场；身后的河水已经冲走了人行道。'],
  '¿Me copian? El río sigue creciendo, necesito que me respondan.': ['Do you copy? The river keeps rising, I need you to answer.', '收到吗？河水还在上涨，我需要你们回复。'],
  '¡Central! Aquí el agua sube rápido, ¿me escuchan?': ['Control room! The water is rising fast here, can you hear me?', '指挥中心！这里水涨得很快，听得到吗？'],
  'Esperando confirmación': ['Awaiting confirmation', '等待确认'],
  '¿Me copian en la central? Ya salimos de la zona baja, espero confirmación.': ['Control room, do you copy? We’re out of the low area, waiting for confirmation.', '指挥中心收到吗？我们已离开低洼区，等待确认。'],
  '¡Por favor respondan! Necesito saber si ya nos registraron como evacuados.': ['Please answer! I need to know if we’re registered as evacuated.', '请回复！我需要知道我们是否已登记为已撤离。'],
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
  // chat con el ayudante
  // voz: «X ya está a salvo» (frases variadas) y cierre
  [/^Los niños (\S+)$/, (l, m) => l === 'zh' ? `${m[1]} 家的孩子们` : `The ${m[1]} children`],
  [/^La familia (\S+)$/, (l, m) => l === 'zh' ? `${m[1]} 一家` : `The ${m[1]} family`],
  [/^¡Qué alivio! (.+) ya (está|están) bien y a salvo\.$/, (l, m) => l === 'zh' ? `太好了！${t(m[1], l)}已经平安无事。` : `What a relief! ${t(m[1], l)} ${m[2] === 'están' ? 'are' : 'is'} safe and sound.`],
  [/^Confirmado: (.+) ya se (encuentra|encuentran) a salvo\. Todo bien por allá\.$/, (l, m) => l === 'zh' ? `已确认：${t(m[1], l)}已经安全了。那边一切都好。` : `Confirmed: ${t(m[1], l)} ${m[2] === 'encuentran' ? 'are' : 'is'} safe. All good over there.`],
  [/^Listo\. (.+) ya (está|están) fuera de peligro, y bien resguardad[oa]s?\.$/, (l, m) => l === 'zh' ? `好了。${t(m[1], l)}已经脱离危险，安置妥当。` : `Done. ${t(m[1], l)} ${m[2] === 'están' ? 'are' : 'is'} out of danger and well sheltered.`],
  [/^Buenas noticias: (.+) ya (está|están) a salvo, en un lugar seguro\.$/, (l, m) => l === 'zh' ? `好消息：${t(m[1], l)}已经安全，在安全的地方。` : `Good news: ${t(m[1], l)} ${m[2] === 'están' ? 'are' : 'is'} safe, somewhere secure.`],
  // chat: zona lejos y tarjeta
  [/^¿Ya tienen a (.+) resguardad[oa]s?\?$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 已经安置好了吗？` : `Is ${t(m[1], l)} sheltered yet?`],
  [/^¿(.+) ya saben? que van a salir\?$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 知道要撤离了吗？` : `Does ${t(m[1], l)} know you’re leaving?`],
  [/^¿Puedes ir con calma donde (.+)\?$/, (l, m) => l === 'zh' ? `你能从容地去 ${t(m[1], l)} 那里吗？` : `Can you calmly go to ${t(m[1], l)}?`],
  [/^Todavía tenemos buen margen antes de que llegue la crecida; ya voy por (.+) para movernos con calma\.$/, (l, m) => l === 'zh' ? `洪水到来前还有充足的时间；我这就去接 ${t(m[1], l)}，从容转移。` : `We still have a good margin before the flood arrives; I’m going for ${t(m[1], l)} so we can move calmly.`],
  [/^Todo tranquilo por esta zona de momento, ya estoy acompañando a (.+) para dejarl[oa]s? bien resguardad[oa]s?\.$/, (l, m) => l === 'zh' ? `这片区域目前一切平静，我正陪着 ${t(m[1], l)}，把对方安置妥当。` : `All calm in this area for now; I’m already with ${t(m[1], l)} to get them safely sheltered.`],
  [/^Recibido, central\. Voy donde (.+) con tiempo; por aquí el río todavía está lejos\.$/, (l, m) => l === 'zh' ? `收到，指挥中心。我从容前往 ${t(m[1], l)} 那里；这里河水还远。` : `Copy, control room. Heading to ${t(m[1], l)} in good time; the river is still far from here.`],
  [/^Preferimos adelantarnos: ya estamos con (.+) en la escuela, con tiempo de sobra\.$/, (l, m) => l === 'zh' ? `我们宁愿提前：已经和 ${t(m[1], l)} 在学校了，时间绰绰有余。` : `We preferred to get ahead: we’re at the school with ${t(m[1], l)}, with time to spare.`],
  [/^Ya estamos ubicados en la escuela con (.+), con tiempo de sobra; aquí todavía no llega el agua\.$/, (l, m) => l === 'zh' ? `我们已经和 ${t(m[1], l)} 在学校安顿好了，时间充裕；这里还没进水。` : `We’re settled at the school with ${t(m[1], l)}, with time to spare; the water hasn’t reached here.`],
  [/^Ya estamos con (.+) en la escuela, todo en orden; por aquí sigue tranquilo\.$/, (l, m) => l === 'zh' ? `我们已经和 ${t(m[1], l)} 在学校了，一切正常；这里依然平静。` : `We’re at the school with ${t(m[1], l)}, all in order; it’s still calm here.`],
  [/^Ya estoy con (.+)\. Hay tiempo, pero me gustaría saber si salimos ya\.$/, (l, m) => l === 'zh' ? `我已经和 ${t(m[1], l)} 在一起了。还有时间，但想知道是否现在就走。` : `I’m with ${t(m[1], l)}. There’s time, but I’d like to know if we should leave now.`],
  [/^Seguimos en el lugar seguro con (.+)\. Cuando puedan, confirmen la evacuación\.$/, (l, m) => l === 'zh' ? `我们还和 ${t(m[1], l)} 在安全地点。方便时请确认撤离。` : `We’re still at the safe place with ${t(m[1], l)}. When you can, please confirm the evacuation.`],
  [/^Confirmar evacuación de (.+)$/, (l, m) => l === 'zh' ? `确认 ${t(m[1], l)} 的撤离` : `Confirm ${t(m[1], l)}’s evacuation`],
  [/^Abrir chat con (.+)$/, (l, m) => l === 'zh' ? `打开与 ${t(m[1], l)} 的聊天` : `Open chat with ${t(m[1], l)}`],
  [/^¿Ya tienen a (.+) con ustedes\?$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 和你们在一起了吗？` : `Do you have ${t(m[1], l)} with you?`],
  [/^¿Cómo está (.+)\?$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 怎么样？` : `How is ${t(m[1], l)}?`],
  [/^¿(.+) entendió el aviso\?$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 明白警报了吗？` : `Did ${t(m[1], l)} understand the alert?`],
  [/^¿Pudieron explicarle a (.+) en (\S+)\?$/, (l, m) => l === 'zh' ? `你们用${t(m[2], l)}跟 ${t(m[1], l)} 解释了吗？` : `Were you able to explain it to ${t(m[1], l)} in ${t(m[2], l)}?`],
  [/^La calle ya es un río, el agua pasa la rodilla\. Pero ya salimos con (.+) y estamos a salvo en lo alto\.$/, (l, m) => l === 'zh' ? `街道已经变成了河，水没过膝盖。不过我们已经和 ${t(m[1], l)} 出来了，在高处很安全。` : `The street is a river now, the water is over the knee. But we got out with ${t(m[1], l)} and we’re safe up high.`],
  [/^¡Sí! Ya llegamos al punto alto con (.+)\. Desde aquí se ve cómo el río tapa la calle\.$/, (l, m) => l === 'zh' ? `是的！我们已经和 ${t(m[1], l)} 到了高处。从这里能看到河水淹没了街道。` : `Yes! We reached high ground with ${t(m[1], l)}. From here you can see the river covering the street.`],
  [/^El paso de abajo se cortó, pero subimos por el callejón con (.+)\. Ya estamos en lugar seguro\.$/, (l, m) => l === 'zh' ? `下面的路断了，但我们和 ${t(m[1], l)} 从小巷上来了。现在已经在安全的地方。` : `The lower way got cut off, but we went up the alley with ${t(m[1], l)}. We’re somewhere safe now.`],
  [/^Sí, tengo a (.+) conmigo\. Subimos la silla de ruedas entre dos vecinos; ya estamos a salvo\.$/, (l, m) => l === 'zh' ? `是的，${t(m[1], l)} 和我在一起。两个邻居一起把轮椅抬上来了；我们已经安全了。` : `Yes, I have ${t(m[1], l)} with me. Two neighbors carried the wheelchair up; we’re safe now.`],
  [/^(.+) está conmigo; le avisé con señas y entendió todo\. Ya estamos a salvo en lo alto\.$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 和我在一起；我用手语告诉了对方，对方全都明白了。我们已经在高处安全了。` : `${t(m[1], l)} is with me; I told them in sign language and they understood everything. We’re safe up high.`],
  [/^Los tengo a los (\d+) conmigo, asustados pero bien\. Ya estamos a salvo en la escuela\.$/, (l, m) => l === 'zh' ? `${m[1]} 个孩子都和我在一起，受了惊吓但都还好。我们已经在学校安全了。` : `I have all ${m[1]} with me, scared but fine. We’re safe at the school now.`],
  [/^(.+) está conmigo; le expliqué en (\S+) y entendió todo\. Ya estamos a salvo\.$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 和我在一起；我用${t(m[2], l)}解释了，对方全都明白了。我们已经安全了。` : `${t(m[1], l)} is with me; I explained it in ${t(m[2], l)} and they understood everything. We’re safe now.`],
  [/^(.+) está conmigo y está bien\. Ya estamos a salvo, fuera del agua\.$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 和我在一起，一切都好。我们已经安全了，离开了水。` : `${t(m[1], l)} is with me and doing fine. We’re safe now, out of the water.`],
  [/^¿Cuánto te falta para llegar donde (.+)\?$/, (l, m) => l === 'zh' ? `你还要多久才能到 ${t(m[1], l)} 那里？` : `How long until you reach ${t(m[1], l)}?`],
  [/^¿Ya tienen a (.+) en lugar seguro\?$/, (l, m) => l === 'zh' ? `${t(m[1], l)} 已经在安全的地方了吗？` : `Do you have ${t(m[1], l)} somewhere safe yet?`],
  [/^¡Ya voy por (.+)!$/, (l, m) => l === 'zh' ? `我这就去接 ${t(m[1], l)}！` : `On my way to get ${t(m[1], l)}!`],
  [/^¡Ya voy por (.+)! El agua ya está cubriendo la calle\.$/, (l, m) => l === 'zh' ? `我这就去接 ${t(m[1], l)}！水已经漫过街道了。` : `On my way to get ${t(m[1], l)}! The water is already covering the street.`],
  [/^¡Voy corriendo a buscar a (.+), el río está bramando!$/, (l, m) => l === 'zh' ? `我跑着去接 ${t(m[1], l)}，河水在怒吼！` : `Running to get ${t(m[1], l)}, the river is roaring!`],
  [/^¡En camino por (.+)! La corriente ya pasa por la esquina\.$/, (l, m) => l === 'zh' ? `正在去接 ${t(m[1], l)}！水流已经冲到街角了。` : `On my way for ${t(m[1], l)}! The current is already at the corner.`],
  [/^¡Ya salgo por (.+)! El río suena cada vez más fuerte\.$/, (l, m) => l === 'zh' ? `我这就出发去接 ${t(m[1], l)}！河声越来越响了。` : `Heading out for ${t(m[1], l)}! The river is getting louder and louder.`],
  [/^¡Ya está! Sacamos a (.+) justo a tiempo, estamos en punto alto\.$/, (l, m) => l === 'zh' ? `好了！我们及时把 ${t(m[1], l)} 救出来了，现在在高处。` : `Done! We got ${t(m[1], l)} out just in time, we’re on high ground.`],
  [/^¡Lo logramos! (.+) ya está con nosotros en la escuela, el agua sigue subiendo\.$/, (l, m) => l === 'zh' ? `成功了！${t(m[1], l)} 已经和我们在学校了，水还在涨。` : `We made it! ${t(m[1], l)} is with us at the school, the water keeps rising.`],
  [/^¡Central, respondan! Ya llegué donde (.+), el agua nos llega a los tobillos\.$/, (l, m) => l === 'zh' ? `指挥中心，请回复！我已经到了 ${t(m[1], l)} 那里，水已没过脚踝。` : `Control room, answer! I’ve reached ${t(m[1], l)}, the water is up to our ankles.`],
  [/^¡Sigo con (.+) y la señal se corta! Escríbanme por favor\.$/, (l, m) => l === 'zh' ? `我还和 ${t(m[1], l)} 在一起，信号时断时续！请给我发消息。` : `I’m still with ${t(m[1], l)} and the signal keeps cutting out! Please write to me.`],
  [/^¡Central, por favor confirmen recibido! Ya estamos en punto alto con (.+)\.$/, (l, m) => l === 'zh' ? `指挥中心，请确认收到！我们已和 ${t(m[1], l)} 到了高处。` : `Control room, please confirm! We’re on high ground with ${t(m[1], l)}.`],
  [/^¡Sigo esperando que confirmen la evacuación de (.+), la señal está inestable!$/, (l, m) => l === 'zh' ? `我还在等你们确认 ${t(m[1], l)} 的撤离，信号不稳定！` : `Still waiting for you to confirm ${t(m[1], l)}’s evacuation, the signal is unstable!`],
  [/^Alerta enviada a (.+)\. El agua llega en (.+)\.$/, (l, m) => l === 'zh' ? `警报已发送给 ${t(m[1], l)}。洪水将在 ${t(m[2], l)}后到达。` : `Alert sent to ${t(m[1], l)}. The water arrives in ${t(m[2], l)}.`],
  [/^Chat con (.+)$/, (l, m) => l === 'zh' ? `与 ${t(m[1], l)} 聊天` : `Chat with ${t(m[1], l)}`],
  [/^(\d+:\d\d) · Central$/, (l, m) => `${m[1]} · ${l === 'zh' ? '指挥中心' : 'Control room'}`],
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
  [/^(.+): al rescate oficial$/, (l, m) => l === 'zh' ? `${m[1]}：转交官方救援` : `${m[1]}: handed to official rescue`],
  [/^Sin confirmación a 30 min del agua$/, (l) => l === 'zh' ? '距洪水到达 30 分钟仍未确认' : 'No confirmation 30 min before the water'],
  [/^(.+) pasa al rescate oficial\.$/, (l, m) => l === 'zh' ? `${m[1]} 转交官方救援。` : `${m[1]} is handed to official rescue.`],
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
