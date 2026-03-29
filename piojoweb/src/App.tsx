import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, RequireAuth } from "@/components/AuthProvider";
import RequireAdmin from "@/components/RequireAdmin";
import Login from "./pages/Login";
import LoginDashboard from "./pages/Dashboard/pages/LoginDashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";
import Vender from "./pages/Vender";
import Sell from "./pages/Sell";
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
              <Route path="/register" element={<Register />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/vender" element={<Vender />} />
              <Route path="/sell" element={<Sell />} />
              <Route path="/dashboard/login" element={<LoginDashboard />} />

              <Route path="/dashboard" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><DashboardIndex /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/usuarios" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><UsuariosPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/usuarios" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><UsuariosPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/roles" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><RolesPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/publicaciones" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><PublicacionesPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/publicaciones" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><PublicacionesPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/detalle-publicaciones" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><DetallePublicacionesPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/estados" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><EstadosPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/municipios" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><MunicipioPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/puntos-entrega" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><PuntosEntregaPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/carreras" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><CarrerasPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/conversaciones" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><ConversacionesPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/mensajes" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><MensajesPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/pagos" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><PagosPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/detalle-ventas" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><DetalleVentasPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/historial-tratos" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><HistorialTratosPage /></DashboardLayout></RequireAdmin>} />
              <Route path="/dashboard/cupones" element={<RequireAdmin redirectTo="/dashboard/login"><DashboardLayout><CuponesPage /></DashboardLayout></RequireAdmin>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </AuthProvider>
);

export default App;
