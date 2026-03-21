import {
  Users, MapPin, Tag, ShoppingBag, MessageSquare, CreditCard,
  Star, Ticket, Image, FileText, GraduationCap, Map, Shield, LayoutDashboard
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const sections = [
  {
    label: "General",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Usuarios",
    items: [
      { title: "Usuarios", url: "/dashboard/usuarios", icon: Users },
      { title: "Roles", url: "/dashboard/roles", icon: Shield },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { title: "Publicaciones", url: "/dashboard/publicaciones", icon: ShoppingBag },
      { title: "Fotos Publicaciones", url: "/dashboard/detalle-publicaciones", icon: Image },
    ],
  },
  {
    label: "Ubicaciones",
    items: [
      { title: "Estados", url: "/dashboard/estados", icon: Map },
      { title: "Municipios", url: "/dashboard/municipios", icon: MapPin },
      { title: "Puntos de Entrega", url: "/dashboard/puntos-entrega", icon: Tag },
      { title: "Carreras", url: "/dashboard/carreras", icon: GraduationCap },
    ],
  },
  {
    label: "Mensajería",
    items: [
      { title: "Conversaciones", url: "/dashboard/conversaciones", icon: MessageSquare },
      { title: "Mensajes", url: "/dashboard/mensajes", icon: FileText },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { title: "Pagos", url: "/dashboard/pagos", icon: CreditCard },
      { title: "Historial Tratos", url: "/dashboard/historial-tratos", icon: Star },
      { title: "Detalle Ventas", url: "/dashboard/detalle-ventas", icon: ShoppingBag },
      { title: "Cupones", url: "/dashboard/cupones", icon: Ticket },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 h-12 flex items-center border-r border-sidebar-border">
          {!collapsed && (
            <h2 className="text-lg font-bold text-primary tracking-tight">
              El Piojo
            </h2>
          )}
        </div>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground/70">
              {!collapsed && section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="hover:bg-sidebar-accent/50 transition-colors"
                        activeClassName="bg-sidebar-accent text-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
