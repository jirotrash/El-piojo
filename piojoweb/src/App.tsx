import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, RequireAuth } from "@/components/AuthProvider";
import Login from "./pages/Login";
import LoginDashboard from "./pages/Dashboard/pages/LoginDashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import DashboardIndex from "./pages/Dashboard/pages/indexDashboard";
import { DashboardLayout } from "./pages/Dashboard/components/DashboardLayout";
import UsuariosPage from "./pages/Dashboard/pages/UsuariosPage";
import RolesPage from "./pages/Dashboard/pages/RolesPage";
import PublicacionesPage from "./pages/Dashboard/pages/PublicacionesPage";
import DetallePublicacionesPage from "./pages/Dashboard/pages/DetallePublicacionesPage";
import EstadosPage from "./pages/Dashboard/pages/EstadosPage";
import MunicipioPage from "./pages/Dashboard/pages/MunicipioPage";
import PuntosEntregaPage from "./pages/Dashboard/pages/PuntosEntregaPage";
import CarrerasPage from "./pages/Dashboard/pages/CarrerasPage";
import ConversacionesPage from "./pages/Dashboard/pages/ConversacionPagen";
import MensajesPage from "./pages/Dashboard/pages/MensajesPage";
import PagosPage from "./pages/Dashboard/pages/PagosPage";
import DetalleVentasPage from "./pages/Dashboard/pages/DetalleVentasPage";
import HistorialTratosPage from "./pages/Dashboard/pages/HistorialTratosPage";
import CuponesPage from "./pages/Dashboard/pages/CuponesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard/login" element={<LoginDashboard />} />

              <Route path="/dashboard" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><DashboardIndex /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/usuarios" element={<RequireAuth><DashboardLayout><UsuariosPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/usuarios" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><UsuariosPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/roles" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><RolesPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/publicaciones" element={<RequireAuth><DashboardLayout><PublicacionesPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/publicaciones" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><PublicacionesPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/detalle-publicaciones" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><DetallePublicacionesPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/estados" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><EstadosPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/municipios" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><MunicipioPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/puntos-entrega" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><PuntosEntregaPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/carreras" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><CarrerasPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/conversaciones" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><ConversacionesPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/mensajes" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><MensajesPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/pagos" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><PagosPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/detalle-ventas" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><DetalleVentasPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/historial-tratos" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><HistorialTratosPage /></DashboardLayout></RequireAuth>} />
              <Route path="/dashboard/cupones" element={<RequireAuth redirectTo="/dashboard/login"><DashboardLayout><CuponesPage /></DashboardLayout></RequireAuth>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </AuthProvider>
);

export default App;
