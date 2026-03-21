    import { Users, ShoppingBag, CreditCard, MessageSquare, TrendingUp, Package } from "lucide-react";
    import { publicaciones, pagos, conversaciones, usuarios as mockUsuarios } from "../lib/mock-data";
    import useUsuarioApi from "../hooks/useUsuarioApi";
    import {
      BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
      PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
    } from "recharts";

// stats will be computed inside the component to allow fetched data

const categoriaData = [
  { name: "Sudaderas", cantidad: 5, ventas: 1800 },
  { name: "Pantalones", cantidad: 8, ventas: 3200 },
  { name: "Playeras", cantidad: 12, ventas: 2800 },
  { name: "Chamarras", cantidad: 3, ventas: 2400 },
  { name: "Zapatos", cantidad: 6, ventas: 1900 },
  { name: "Accesorios", cantidad: 4, ventas: 800 },
];

const ventasMensuales = [
  { mes: "Ene", ventas: 4200, usuarios: 12 },
  { mes: "Feb", ventas: 5800, usuarios: 18 },
  { mes: "Mar", ventas: 4900, usuarios: 22 },
  { mes: "Abr", ventas: 7200, usuarios: 28 },
  { mes: "May", ventas: 6100, usuarios: 35 },
  { mes: "Jun", ventas: 8500, usuarios: 42 },
];

const estadoPagos = [
  { name: "Completado", value: 65, color: "hsl(160, 84%, 39%)" },
  { name: "Pendiente", value: 25, color: "hsl(38, 92%, 50%)" },
  { name: "Cancelado", value: 10, color: "hsl(0, 72%, 51%)" },
];

const generoData = [
  { name: "Hombre", value: 45, color: "hsl(200, 70%, 55%)" },
  { name: "Mujer", value: 38, color: "hsl(280, 60%, 60%)" },
  { name: "Unisex", value: 17, color: "hsl(160, 84%, 39%)" },
];

const Index = () => {
  const { data: usuariosData = [], loading: usuariosLoading } = useUsuarioApi();
  const usuariosList: any[] = (usuariosData && usuariosData.length) ? (usuariosData as any[]) : (mockUsuarios as any[]);

  const stats = [
    { label: "Usuarios", value: usuariosList.length, icon: Users, color: "text-primary" },
    { label: "Publicaciones", value: publicaciones.length, icon: ShoppingBag, color: "text-accent-foreground" },
    { label: "Pagos", value: pagos.length, icon: CreditCard, color: "text-warning" },
    { label: "Conversaciones", value: conversaciones.length, icon: MessageSquare, color: "text-primary" },
    { label: "Artículos Disponibles", value: publicaciones.filter(p => p.disponible).length, icon: Package, color: "text-accent-foreground" },
    { label: "Ventas Completadas", value: pagos.filter(p => p.estado === "Completado").length, icon: TrendingUp, color: "text-success" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Resumen general del marketplace universitario</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border rounded-lg p-5 hover:border-primary/30 transition-colors min-h-[84px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ventas Mensuales - Area Chart */}
        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Ventas Mensuales ($)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={ventasMensuales}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(215, 12%, 55%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 12%, 55%)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220, 18%, 13%)", border: "1px solid hsl(220, 14%, 20%)", borderRadius: 8, color: "hsl(210, 20%, 92%)" }}
              />
              <Area type="monotone" dataKey="ventas" stroke="hsl(160, 84%, 39%)" fill="url(#colorVentas)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
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

        {/* Usuarios Nuevos - Line Chart */}
        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Usuarios Nuevos</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ventasMensuales}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(215, 12%, 55%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 12%, 55%)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220, 18%, 13%)", border: "1px solid hsl(220, 14%, 20%)", borderRadius: 8, color: "hsl(210, 20%, 92%)" }}
              />
              <Line type="monotone" dataKey="usuarios" stroke="hsl(280, 60%, 60%)" strokeWidth={2} dot={{ fill: "hsl(280, 60%, 60%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Publicaciones Recientes</h3>
          <div className="space-y-3">
            {publicaciones.slice(0, 4).map((pub) => (
              <div key={pub.id_publicaciones} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{pub.titulo}</p>
                  <p className="text-xs text-muted-foreground">{pub.categoria} · {pub.marca}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-semibold text-primary">${pub.precio}</p>
                  <span className={`text-xs ${pub.disponible ? 'text-success' : 'text-destructive'}`}>
                    {pub.disponible ? "Disponible" : "No disponible"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Últimos Usuarios</h3>
          <div className="space-y-3">
            {usuariosList.slice(0, 4).map((u: any) => {
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
