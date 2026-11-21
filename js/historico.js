// Riada real del Piraí, 12–13/12/2025 (El Torno: al menos 20 fallecidos según los reportes de prensa).
// Lluvia horaria que los modelos abiertos veían en los 5 puntos de la cuenca alta (el peor punto cada hora),
// tomada de Open-Meteo Historical Forecast API (best_match). Caudal diario GloFAS (Open-Meteo Flood API) en La Angostura.
// Lo generó herramientas/riada-2025.py el 21/11/2026. Conclusión: los modelos globales NO vieron la tormenta del Amboró.
export const RIADA_2025 = {
  inicio: '2025-12-12T06:00',
  lluviaHora: [0.1, 0.1, 0.1, 0.1, 0, 0.1, 0.1, 0.2, 2.7, 0.3, 0.6, 0.5, 0.2, 0.5, 1.2, 2.2, 2.3, 3.1, 1.3, 0.9, 0.2, 0.5, 0.3, 2.1, 0.4],
  caudalDia: {"2025-12-11": 12.24, "2025-12-12": 11.94, "2025-12-13": 11.59, "2025-12-14": 11.56},
  desborde: '2025-12-13T03:00', // «madrugada del sábado 13», reportes de prensa
  // el momento del reporte de los vigías río arriba es HIPOTÉTICO: lo calcula repetirRiada() desde el desborde
  fuentes: [
    ['El País (Bolivia), 14/12/2025', 'https://elpais.bo/nacional/20251214_desborde-del-rio-pirai-deja-inundacion-muertos-desaparecidos-y-evacuados.html'],
    ['El Deber, 16/12/2025', 'https://eldeber.com.bo/santa-cruz/declaran-desastre-riada-historica-pirai-deja-20-muertos_1765881778'],
    ['Brújula Digital, 13/12/2025', 'https://brujuladigital.net/sociedad/2025/12/13/el-rio-pirai-se-desborda-en-el-torno-pobladores-suben-a-los-techos-para-resguardarse-54922'],
  ],
};
