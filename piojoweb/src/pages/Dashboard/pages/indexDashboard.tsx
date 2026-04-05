// @ts-nocheck
import { Users, ShoppingBag, CreditCard, MessageSquare, TrendingUp, Package } from "lucide-react";
import useUsuarioApi from "../hooks/useUsuarioApi";
import usePublicacionesApi from "../hooks/usePublicacionesApi";
import usePagosApi from "../hooks/usePagosApi";
import useConversacionesApi from "../hooks/useConversacionesApi";
import { laplace, generarPredicciones } from "@/lib/laplace";
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts";

// Procesamiento de datos real de la API con sistema de predicciones

const Index = () => {
  // Fetch real data from API
  const { data: usuariosData = [], loading: usuariosLoading } = useUsuarioApi(1, 10000);
  const { data: publicacionesData = [], loading: publicacionesLoading } = usePublicacionesApi();
  const { data: pagosData = [], loading: pagosLoading } = usePagosApi();
  const { data: conversacionesData = [], loading: conversacionesLoading } = useConversacionesApi();

  // Process real data with Laplace predictions
  const processedData = useMemo(() => {
    const usuarios = Array.isArray(usuariosData) ? usuariosData : [];
    const publicaciones = Array.isArray(publicacionesData) ? publicacionesData : [];
    const pagos = Array.isArray(pagosData) ? pagosData : [];
    const conversaciones = Array.isArray(conversacionesData) ? conversacionesData : [];

    // Group publications by category
    const categorias = publicaciones.reduce((acc: any, pub: any) => {
      const cat = pub.categoria || 'Otros';
      if (!acc[cat]) acc[cat] = { name: cat, cantidad: 0, ventas: 0 };
      acc[cat].cantidad += 1;
      acc[cat].ventas += Number(pub.precio || 0);
      return acc;
    }, {});

    const categoriaData = Object.values(categorias).slice(0, 6) as any[];

    // Group by gender
    const generos = publicaciones.reduce((acc: any, pub: any) => {
      const gen = pub.genero || 'Unisex';
      acc[gen] = (acc[gen] || 0) + 1;
      return acc;
    }, {});

    const totalPubs = publicaciones.length || 1;
    const generoData = [
      { name: "Hombre", value: Math.round(((generos.Hombre || 0) / totalPubs) * 100), color: "hsl(200, 70%, 55%)" },
      { name: "Mujer", value: Math.round(((generos.Mujer || 0) / totalPubs) * 100), color: "hsl(280, 60%, 60%)" },
      { name: "Unisex", value: Math.round(((generos.Unisex || 0) / totalPubs) * 100), color: "hsl(160, 84%, 39%)" },
    ];

    // Payment status distribution
    const pagosPorEstado = pagos.reduce((acc: any, pago: any) => {
      const estado = pago.estado || 'Pendiente';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    const totalPagos = pagos.length || 1;
    const estadoPagos = [
      { name: "Completado", value: Math.round(((pagosPorEstado.COMPLETADO || pagosPorEstado.Completado || 0) / totalPagos) * 100), color: "hsl(160, 84%, 39%)" },
      { name: "Pendiente", value: Math.round(((pagosPorEstado.PENDIENTE || pagosPorEstado.Pendiente || 0) / totalPagos) * 100), color: "hsl(38, 92%, 50%)" },
      { name: "Cancelado", value: Math.round(((pagosPorEstado.CANCELADO || pagosPorEstado.Cancelado || 0) / totalPagos) * 100), color: "hsl(0, 72%, 51%)" },
    ];

    // Monthly sales data (last 6 months) with Laplace predictions
    const ahora = new Date();
    const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const ventasMensuales = [];
    const serieVentas: number[] = [];
    const serieUsuarios: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mesNombre = mesesNombres[fecha.getMonth()];
      
      // Count sales in this month
      const ventasDelMes = pagos.filter((p: any) => {
        const fechaPago = new Date(p.fecha_pago || p.created_at || Date.now());
        return fechaPago.getMonth() === fecha.getMonth() && fechaPago.getFullYear() === fecha.getFullYear();
      });
      
      const ventasTotal = ventasDelMes.reduce((sum: number, p: any) => sum + Number(p.total || 0), 0);
      
      // Count new users in this month
      const usuariosDelMes = usuarios.filter((u: any) => {
        const fechaRegistro = new Date(u.fecha_registro || u.created_at || Date.now());
        return fechaRegistro.getMonth() === fecha.getMonth() && fechaRegistro.getFullYear() === fecha.getFullYear();
      }).length;

      ventasMensuales.push({ mes: mesNombre, ventas: ventasTotal, usuarios: usuariosDelMes });
      serieVentas.push(ventasTotal);
      serieUsuarios.push(usuariosDelMes);
    }

    // Generate predictions using Laplace transform
    const prediccionVentas = laplace(serieVentas, 0.3);
    const prediccionesVentas = generarPredicciones(serieVentas, 3, 0.3);
    const prediccionUsuarios = laplace(serieUsuarios, 0.3);

    // Add predicted months
    for (let i = 1; i <= 3; i++) {
      const fechaPred = new Date(ahora.getFullYear(), ahora.getMonth() + i, 1);
      const mesNombre = mesesNombres[fechaPred.getMonth()];
      ventasMensuales.push({ 
        mes: `${mesNombre}*`, 
        ventas: Math.round(prediccionesVentas[i - 1] || prediccionVentas.prediccion),
        usuarios: Math.round(prediccionUsuarios.prediccion),
        prediccion: true 
      });
    }

    return {
      usuarios,
      publicaciones,
      pagos,
      conversaciones,
      categoriaData,
      generoData,
      estadoPagos,
      ventasMensuales,
      prediccionVentas,
      prediccionUsuarios,
    };
  }, [usuariosData, publicacionesData, pagosData, conversacionesData]);

  const { usuarios, publicaciones, pagos, conversaciones, categoriaData, generoData, estadoPagos, ventasMensuales, prediccionVentas, prediccionUsuarios } = processedData;

  const stats = [
    { 
      label: "Usuarios", 
      value: usuarios.length, 
      icon: Users, 
      color: "text-primary",
      prediccion: Math.round(prediccionUsuarios.prediccion),
      confianza: prediccionUsuarios.confianza_pct,
      tendencia: prediccionUsuarios.tendencia
    },
    { 
      label: "Publicaciones", 
      value: publicaciones.length, 
      icon: ShoppingBag, 
      color: "text-accent-foreground",
      prediccion: Math.round(publicaciones.length * 1.05), // 5% estimado
      confianza: 75,
      tendencia: publicaciones.length * 0.05
    },
    { 
      label: "Pagos", 
      value: pagos.length, 
      icon: CreditCard, 
      color: "text-warning",
      prediccion: Math.round(prediccionVentas.prediccion / 100), // Aprox basado en ventas
      confianza: prediccionVentas.confianza_pct,
      tendencia: prediccionVentas.tendencia / 100
    },
    { 
      label: "Conversaciones", 
      value: conversaciones.length, 
      icon: MessageSquare, 
      color: "text-primary",
      prediccion: Math.round(conversaciones.length * 1.08),
      confianza: 70,
      tendencia: conversaciones.length * 0.08
    },
    { 
      label: "Artículos Disponibles", 
      value: publicaciones.filter((p: any) => p.disponible).length, 
      icon: Package, 
      color: "text-accent-foreground"
    },
    { 
      label: "Ventas Completadas", 
      value: pagos.filter((p: any) => p.estado === "COMPLETADO" || p.estado === "Completado").length, 
      icon: TrendingUp, 
      color: "text-success"
    },
  ];

  const isLoading = usuariosLoading || publicacionesLoading || pagosLoading || conversacionesLoading;

  if (isLoading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Resumen general del marketplace universitario</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Predicción Activa</span>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Stats con Predicciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const tendenciaPositiva = stat.tendencia && stat.tendencia > 0;
          const confianzaAlta = stat.confianza && stat.confianza > 80;
          const confianzaMedia = stat.confianza && stat.confianza > 60;
          
          return (
            <div key={stat.label} className="bg-card border rounded-lg p-5 hover:border-primary/30 transition-colors min-h-[120px] flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-3xl font-bold">{stat.value}</p>
                {stat.prediccion && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Próximo mes:</span>
                    <span className="text-lg font-semibold text-purple-400">{stat.prediccion}</span>
                    <span className={`text-xs ${tendenciaPositiva ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tendenciaPositiva ? '↗' : '↘'} {stat.tendencia ? Math.abs(stat.tendencia).toFixed(1) : ''}
                    </span>
                  </div>
                )}
                {stat.confianza && (
                  <div className="mt-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Confianza</span>
                      <span className={`font-semibold ${confianzaAlta ? 'text-emerald-500' : confianzaMedia ? 'text-amber-500' : 'text-red-500'}`}>
                        {stat.confianza}%
                      </span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all ${confianzaAlta ? 'bg-emerald-500' : confianzaMedia ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${stat.confianza}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ventas Mensuales con Predicciones */}
        <div className="bg-card border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ventas Mensuales ($)</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Real
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Predicción
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={ventasMensuales}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPrediccion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(280, 60%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(280, 60%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(215, 12%, 55%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 12%, 55%)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220, 18%, 13%)", border: "1px solid hsl(220, 14%, 20%)", borderRadius: 8, color: "hsl(210, 20%, 92%)" }}
                formatter={(value: any, name: any, props: any) => {
                  const isPred = props.payload.prediccion;
                  return [`$${value?.toFixed(2)}`, isPred ? 'Predicción' : 'Ventas'];
                }}
              />
              <Area 
                type="monotone" 
                dataKey="ventas" 
                stroke={(entry: any) => entry.prediccion ? "hsl(280, 60%, 60%)" : "hsl(160, 84%, 39%)"} 
                fill={(entry: any) => entry.prediccion ? "url(#colorPrediccion)" : "url(#colorVentas)"} 
                strokeWidth={2} 
                strokeDasharray={(entry: any) => entry.prediccion ? "5 5" : "0"}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Confianza de predicción: {prediccionVentas.confianza_pct}% | Tendencia: {prediccionVentas.tendencia >= 0 ? '↗' : '↘'} {Math.abs(prediccionVentas.tendencia).toFixed(2)}
          </div>
        </div>

        {/* Publicaciones por Categoría - Bar Chart */}
        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Publicaciones por Categoría</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={categoriaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215, 12%, 55%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 12%, 55%)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220, 18%, 13%)", border: "1px solid hsl(220, 14%, 20%)", borderRadius: 8, color: "hsl(210, 20%, 92%)" }}
              />
              <Bar dataKey="cantidad" fill="hsl(200, 70%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Estado de Pagos - Pie Chart */}
        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Estado de Pagos</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={estadoPagos} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4}>
                {estadoPagos.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220, 18%, 13%)", border: "1px solid hsl(220, 14%, 20%)", borderRadius: 8, color: "hsl(210, 20%, 92%)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {estadoPagos.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                {e.name} ({e.value}%)
              </div>
            ))}
          </div>
        </div>

        {/* Género - Pie Chart */}
        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Productos por Género</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={generoData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4}>
                {generoData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220, 18%, 13%)", border: "1px solid hsl(220, 14%, 20%)", borderRadius: 8, color: "hsl(210, 20%, 92%)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {generoData.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                {e.name} ({e.value}%)
              </div>
            ))}
          </div>
        </div>

        {/* Usuarios Nuevos con Predicciones */}
        <div className="bg-card border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Usuarios Nuevos</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Real
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                Predicción
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ventasMensuales}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(215, 12%, 55%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 12%, 55%)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220, 18%, 13%)", border: "1px solid hsl(220, 14%, 20%)", borderRadius: 8, color: "hsl(210, 20%, 92%)" }}
                formatter={(value: any, name: any, props: any) => {
                  const isPred = props.payload.prediccion;
                  return [value, isPred ? 'Predicción' : 'Usuarios'];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="usuarios" 
                stroke={(entry: any) => entry.prediccion ? "hsl(190, 80%, 55%)" : "hsl(280, 60%, 60%)"} 
                strokeWidth={2} 
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={4} 
                      fill={payload.prediccion ? "hsl(190, 80%, 55%)" : "hsl(280, 60%, 60%)"} 
                      stroke="none"
                    />
                  );
                }}
                strokeDasharray={(entry: any) => entry.prediccion ? "5 5" : "0"}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Confianza: {prediccionUsuarios.confianza_pct}% | Tendencia: {prediccionUsuarios.tendencia >= 0 ? '↗' : '↘'} {Math.abs(prediccionUsuarios.tendencia).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Panel Destacado de Predicciones */}
      <div className="bg-gradient-to-br from-purple-500/10 via-cyan-500/5 to-transparent border-2 border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-500 p-2 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Predicciones del Sistema</h3>
            <p className="text-xs text-muted-foreground">Proyecciones para el próximo mes basadas en datos históricos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Ventas Proyectadas</span>
              <div className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                +{((prediccionVentas.prediccion - ventasMensuales[5]?.ventas) / ventasMensuales[5]?.ventas * 100).toFixed(1)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-400">${prediccionVentas.prediccion.toFixed(0)}</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confianza</span>
              <span className={`font-semibold ${prediccionVentas.confianza_pct >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {prediccionVentas.confianza_pct}%
              </span>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Usuarios Nuevos</span>
              <div className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-semibold">
                +{((prediccionUsuarios.prediccion - ventasMensuales[5]?.usuarios) / ventasMensuales[5]?.usuarios * 100).toFixed(1)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{prediccionUsuarios.prediccion}</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confianza</span>
              <span className={`font-semibold ${prediccionUsuarios.confianza_pct >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {prediccionUsuarios.confianza_pct}%
              </span>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Alpha (α) Promedio</span>
              <div className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-semibold">
                Factor
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-400">{prediccionVentas.alpha}</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Peso exponencial aplicado
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Tendencia General</span>
              <div className={`text-xs px-2 py-0.5 rounded-full font-semibold ${prediccionVentas.tendencia >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {prediccionVentas.tendencia >= 0 ? 'Alcista ↗' : 'Bajista ↘'}
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{prediccionVentas.tendencia >= 0 ? '+' : ''}{prediccionVentas.tendencia.toFixed(2)}</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Incremento por período
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong className="text-purple-400">💡 Nota:</strong> Las predicciones se calculan automáticamente usando análisis de series temporales. 
            Mayor confianza (&gt;80%) indica proyecciones más precisas. Los meses con asterisco (*) son estimaciones futuras.
          </p>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Publicaciones Recientes</h3>
          <div className="space-y-3">
            {publicaciones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay publicaciones recientes
              </div>
            ) : (
              publicaciones.slice(0, 4).map((pub: any) => (
                <div key={pub.id_publicaciones || pub.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{pub.titulo || pub.descripcion || 'Sin título'}</p>
                    <p className="text-xs text-muted-foreground">{pub.categoria || 'Sin categoría'} · {pub.marca || 'Sin marca'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-primary">${pub.precio || 0}</p>
                    <span className={`text-xs ${pub.disponible ? 'text-success' : 'text-destructive'}`}>
                      {pub.disponible ? "Disponible" : "No disponible"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Últimos Usuarios</h3>
          <div className="space-y-3">
            {usuarios.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay usuarios registrados
              </div>
            ) : (
              usuarios.slice(0, 4).map((u: any) => {
                const id = u.id ?? u.id_usuarios ?? u._id ?? JSON.stringify(u);
                const nombre = (u.nombre ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`).trim();
                const apellido = u.apellido_paterno ?? u.apellido ?? '';
                const email = u.email ?? u.correo ?? '';
                const matricula = u.matricula ?? u.registration ?? '';
                return (
                  <div key={id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{nombre} {apellido}</p>
                      <p className="text-xs text-muted-foreground">{email}</p>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{matricula}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
