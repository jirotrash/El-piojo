/**
 * Transformada de Laplace para predicción de series temporales
 * @param serie Array de valores numéricos (serie temporal)
 * @param s Parámetro s de la transformada (controla el peso exponencial)
 * @returns Objeto con predicción, alfa, confianza y métricas estadísticas
 */
export function laplace(serie: number[], s: number = 0.3) {
  if (!serie || serie.length === 0) {
    return {
      prediccion: 0,
      alpha: 0,
      confianza_pct: 0,
      promedio_ponderado: 0,
      tendencia: 0,
    };
  }

  const alpha = Math.exp(-s);
  let F = 0, W = 0;
  
  serie.forEach((valor, k) => {
    const peso = Math.pow(alpha, k);
    F += valor * peso;
    W += peso;
  });
  
  const prediccion = W > 0 ? F / W : 0;
  
  const tendencia = serie.length >= 2
    ? (serie[0] - serie[serie.length - 1]) / (serie.length - 1)
    : 0;
  
  const media = serie.reduce((acc, val) => acc + val, 0) / (serie.length || 1);
  const varianza = serie.reduce((acc, val) => acc + (val - media) ** 2, 0) / (serie.length || 1);
  const cv = media > 0 ? (Math.sqrt(varianza) / media) * 100 : 100;
  const confianza_pct = parseFloat(Math.max(0, Math.min(100, 100 - cv)).toFixed(1));
  
  return {
    prediccion: parseFloat(prediccion.toFixed(2)),
    alpha: parseFloat(alpha.toFixed(4)),
    confianza_pct,
    promedio_ponderado: parseFloat(prediccion.toFixed(2)),
    tendencia: parseFloat(tendencia.toFixed(4)),
  };
}

/**
 * Genera predicciones para los próximos N períodos
 * @param serie Serie temporal histórica
 * @param periodos Número de períodos a predecir
 * @param s Parámetro de la transformada
 * @returns Array con las predicciones
 */
export function generarPredicciones(serie: number[], periodos: number = 3, s: number = 0.3): number[] {
  const predicciones: number[] = [];
  let serieActual = [...serie];
  
  for (let i = 0; i < periodos; i++) {
    const resultado = laplace(serieActual, s);
    const valorPredicho = resultado.prediccion + resultado.tendencia;
    predicciones.push(Math.max(0, valorPredicho)); // Evitar valores negativos
    serieActual = [valorPredicho, ...serieActual].slice(0, serie.length);
  }
  
  return predicciones;
}
