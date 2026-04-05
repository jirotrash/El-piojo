# Dashboard con Predicciones de Laplace

## Descripción

El dashboard ahora está completamente conectado con la API real del servidor en la nube (`api-elpiojo.utvt.cloud`) e integra la **Transformada de Laplace** para generar predicciones sobre ventas futuras y tendencias de usuarios.

## Características Principales

### 1. 📊 Conexión con API Real

El dashboard obtiene datos en tiempo real de:
- **Usuarios**: Total de usuarios registrados
- **Publicaciones**: Artículos publicados y disponibles
- **Pagos**: Transacciones completadas, pendientes y canceladas
- **Conversaciones**: Mensajes y chats del sistema

### 2. 🔮 Predicciones con Transformada de Laplace

#### ¿Qué es la Transformada de Laplace?

La transformada de Laplace es una técnica matemática que permite analizar series temporales asignando **pesos exponenciales** a los valores históricos. Los datos más recientes tienen mayor peso, lo que permite capturar tendencias actuales.

#### Fórmula Implementada

```
F = Σ(valor_k × α^k)
W = Σ(α^k)
predicción = F / W

donde:
α = e^(-s)  (s = parámetro de control, por defecto 0.3)
```

#### Métricas Calculadas

- **Predicción**: Valor estimado para el próximo período
- **Alpha (α)**: Factor de decaimiento exponencial
- **Confianza**: Basada en el coeficiente de variación (100% - CV)
- **Tendencia**: Pendiente de cambio en la serie
- **Promedio Ponderado**: Media considerando pesos exponenciales

### 3. 📈 Visualizaciones Mejoradas

#### Gráfico de Ventas Mensuales
- **Datos históricos** (últimos 6 meses): Línea verde sólida
- **Predicciones** (próximos 3 meses): Línea púrpura punteada
- Mes marcado con asterisco (*) indica predicción
- Métricas de confianza y tendencia mostradas debajo del gráfico

#### Otros Gráficos
- **Publicaciones por Categoría**: Barras con datos reales
- **Estado de Pagos**: Gráfico circular (Completado, Pendiente, Cancelado)
- **Productos por Género**: Distribución Hombre/Mujer/Unisex
- **Usuarios Nuevos**: Tendencia mensual de registros

## Uso

### Acceso al Dashboard

1. Navega a `/dashboard/login`
2. Inicia sesión con credenciales de administrador
3. El dashboard se cargará automáticamente con datos actualizados

### Interpretación de Predicciones

```typescript
// Ejemplo de resultado Laplace
{
  prediccion: 7245.50,        // Ventas estimadas próximo mes ($)
  alpha: 0.7408,              // Factor de peso (cercano a 1 = más peso a datos recientes)
  confianza_pct: 85.3,        // Confiabilidad de la predicción (%)
  tendencia: 450.25,          // Incremento promedio por período
}
```

**Confianza > 80%**: Predicción altamente confiable
**Confianza 60-80%**: Predicción moderada
**Confianza < 60%**: Alta volatilidad, mayor incertidumbre

### Personalizar Parámetros

Para ajustar la sensibilidad de las predicciones, modifica el parámetro `s` en:

```typescript
// En src/lib/laplace.ts
const prediccion = laplace(serie, s); // s por defecto = 0.3

// s más bajo (ej. 0.1): Más peso a datos recientes, predicciones más rápidas
// s más alto (ej. 0.5): Smoothing mayor, predicciones más suaves
```

## Archivos Relacionados

- `src/lib/laplace.ts` - Implementación de la transformada
- `src/pages/Dashboard/pages/indexDashboard.tsx` - Dashboard principal
- `src/pages/Dashboard/hooks/` - Hooks de API para datos

## Estado Actual

✅ Dashboard conectado a API real
✅ Transformada de Laplace implementada
✅ Predicciones en gráficos de ventas
✅ Métricas de confianza calculadas
✅ Datos históricos y futuros visualizados

## Próximas Mejoras

- [ ] Integrar predicciones en otros gráficos (usuarios, categorías)
- [ ] Panel de configuración de parámetros Laplace
- [ ] Exportar predicciones a CSV/PDF
- [ ] Alertas automáticas sobre anomalías detectadas
- [ ] Comparación predicción vs. realidad (feedback loop)

---

**Desarrollado con**: React + TypeScript + Recharts + Transformada de Laplace
