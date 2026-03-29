import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, LogIn, UserPlus, MessageSquare, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import piojoLogo from "@/assets/piojo-logo.png";
import { useAuth } from "./AuthProvider";
import useUsuarioApi from "@/pages/Dashboard/hooks/useUsuarioApi";
import useConversacionesApi from "@/pages/Dashboard/hooks/useConversacionesApi";
import useDetalleMensajesApi from "@/pages/Dashboard/hooks/useDetalleMensajesApi";

const navLinks = [
  { label: "Inicio", href: "#inicio", isRoute: false },
  { label: "Cómo Funciona", href: "#como-funciona", isRoute: false },
  { label: "Catálogo", href: "/catalogo", isRoute: true },
  { label: "Sostenibilidad", href: "#sostenibilidad", isRoute: false },
  { label: "Testimonios", href: "#testimonios", isRoute: false },
  { label: "Contacto", href: "#contacto", isRoute: false },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [openMessages, setOpenMessages] = useState(false);
  const [showConvModal, setShowConvModal] = useState(false);
  const [selectedConv, setSelectedConv] = useState<number | null>(null);

  const { theme, toggleTheme } = useTheme();
  const { token } = useAuth();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data: usuariosData = [] } = useUsuarioApi();
  const { data: conversacionesData = [] } = useConversacionesApi();
  const { data: mensajesData = [] } = useDetalleMensajesApi();

  const userConversations = conversacionesData || [];

  // Derive current user similarly to Profile.tsx: prefer token.sub then token.email, fallback to first
  let tokenEmail: string | null = null;
  let tokenSub: string | null = null;
  if (token) {
    try {
      if ((token.match(/\./g) || []).length === 2) {
        const parts = token.split('.');
        const payload = parts[1];
        const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
        const json = atob(b64 + pad);
        const obj = JSON.parse(json);
        tokenEmail = obj.email || null;
        tokenSub = obj.sub ? String(obj.sub) : null;
      } else {
        const decoded = atob(token);
        const p = decoded.split(":");
        if (p && p[0] && p[0].includes("@")) tokenEmail = p[0];
      }
    } catch (e) {
      tokenEmail = null;
      tokenSub = null;
    }
  }

  const currentUser = useMemo(() => {
    if (!usuariosData || usuariosData.length === 0) return null;
    if (tokenSub) {
      const byId = usuariosData.find((u: any) => String(u.id_usuarios ?? u.id) === String(tokenSub));
      if (byId) return byId;
    }
    if (tokenEmail) {
      const byEmail = usuariosData.find((u: any) => (u.email || '').toLowerCase() === tokenEmail?.toLowerCase());
      if (byEmail) return byEmail;
    }
    return usuariosData[0] || null;
  }, [usuariosData, tokenEmail, tokenSub]);

  const avatarSrc = (v: any) => {
    if (!v) return null;
    try {
      if (typeof v === 'string' && v.startsWith('data:')) return v;
      if (typeof v === 'string' && (v.startsWith('http') || v.startsWith('/'))) return v;
      return null;
    } catch {
      return null;
    }
  };

  const lastMessageByConv: Record<string, any> = {};
  (mensajesData || []).forEach((m: any) => {
    const k = String(m.id_conversaciones);
    if (!lastMessageByConv[k] || new Date(m.fecha_envio) > new Date(lastMessageByConv[k].fecha_envio)) {
      lastMessageByConv[k] = m;
    }
  });

  return (
    <nav>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#inicio" className="flex items-center gap-2">
          <img src={piojoLogo} alt="Piojo logo" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-display text-xl font-bold text-primary">PIOJO</span>
          <span className="hidden sm:inline-block text-xs font-body text-muted-foreground bg-muted px-2 py-0.5 rounded-full">2da mano</span>
        </a>

        <ul className="hidden lg:flex items-center gap-6">
          {navLinks.map((l) => (
            <li key={l.href}>
              {l.isRoute ? (
                <Link to={l.href} className="font-body font-semibold text-sm text-foreground/80 hover:text-primary transition-colors">{l.label}</Link>
              ) : (
                <a href={l.href} className="font-body font-semibold text-sm text-foreground/80 hover:text-primary transition-colors">{l.label}</a>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-full bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Cambiar tema">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {!token ? (
            <>
              <Link to="/login" className="hidden md:inline-flex items-center gap-1.5 text-foreground/80 hover:text-primary font-body font-semibold text-sm transition-colors">
                <LogIn size={16} />
                Ingresar
              </Link>

              <Link to="/register" className="hidden md:inline-flex items-center gap-2 bg-gradient-hero text-primary-foreground font-display font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity text-sm">
                <UserPlus size={16} />
                Regístrate
              </Link>
            </>
          ) : (
            <>
              <Link to="/vender" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity text-sm">Publicar</Link>

              <div className="relative">
                <button onClick={() => setOpenMessages((s) => !s)} className="inline-flex items-center gap-2 text-foreground/90 hover:text-primary transition-colors px-2 py-1">
                  <MessageSquare size={18} />
                  {userConversations.length ? <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">{userConversations.length}</span> : null}
                </button>

                {openMessages && (
                  <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg p-2 z-40">
                    <div className="text-sm font-semibold px-2 py-1">Conversaciones</div>
                    <div className="max-h-56 overflow-auto">
                      {userConversations.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No tienes conversaciones</div>
                      ) : (
                        userConversations.map((c: any) => {
                          const last = lastMessageByConv[String(c.id_conversaciones)];
                          return (
                            <button key={c.id_conversaciones} onClick={() => { setSelectedConv(Number(c.id_conversaciones)); setShowConvModal(true); setOpenMessages(false); }} className="w-full text-left block px-3 py-2 hover:bg-muted rounded-md text-sm">
                              <div className="flex justify-between items-center">
                                <div className="truncate">Conv #{c.id_conversaciones} · Pub #{c.id_publicaciones}</div>
                                <div className="text-xs text-muted-foreground ml-2">{last?.fecha_envio ? new Date(last.fecha_envio).toLocaleDateString() : ''}</div>
                              </div>
                              {last?.mensaje ? <div className="text-xs text-muted-foreground truncate mt-1">{String(last.mensaje).slice(0, 80)}</div> : null}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setOpen(!open)} aria-haspopup="true" className="inline-flex items-center gap-2 text-foreground/90 hover:text-primary transition-colors">
                  {avatarSrc(currentUser?.foto_perfil) ? (
                    <img src={avatarSrc(currentUser?.foto_perfil)} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">{(currentUser?.nombre || 'U').charAt(0)}</div>
                  )}
                  <span className="font-body font-semibold text-sm">{currentUser ? currentUser.nombre : 'Perfil'}</span>
                </button>

                {/* Avatar dropdown */}
                {open && (
                  <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg p-2 z-40">
                    <Link to="/perfil" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm hover:bg-muted rounded-md">Ver perfil</Link>
                    <button onClick={() => { logout(); navigate('/login'); }} className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md flex items-center gap-2">
                      <LogOut size={14} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <button className="lg:hidden text-foreground p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-card border-b border-border overflow-hidden"
          >
            <ul className="flex flex-col items-center gap-4 py-6">
              {navLinks.map((l) => (
                <li key={l.href}>
                  {l.isRoute ? (
                    <Link to={l.href} onClick={() => setOpen(false)} className="font-body font-semibold text-foreground/80 hover:text-primary transition-colors text-lg">{l.label}</Link>
                  ) : (
                    <a href={l.href} onClick={() => setOpen(false)} className="font-body font-semibold text-foreground/80 hover:text-primary transition-colors text-lg">{l.label}</a>
                  )}
                </li>
              ))}

              {!token ? (
                <>
                  <li>
                    <Link to="/login" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 text-foreground/80 hover:text-primary font-body font-semibold text-lg transition-colors">
                      <LogIn size={18} /> Ingresar
                    </Link>
                  </li>

                  <li>
                    <Link to="/register" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 bg-gradient-hero text-primary-foreground font-display font-semibold px-5 py-2 rounded-full">
                      <UserPlus size={18} /> Regístrate
                    </Link>
                  </li>
                </>
              ) : null}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {showConvModal && selectedConv !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConvModal(false)} />
          <div className="relative w-[90%] max-w-2xl bg-card border border-border rounded-xl p-4 z-60">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Conversación #{selectedConv}</div>
              <button onClick={() => setShowConvModal(false)} className="text-sm text-muted-foreground">Cerrar</button>
            </div>
            <div className="max-h-72 overflow-auto space-y-2 mb-3">
              {(mensajesData.filter((m:any) => String(m.id_conversaciones) === String(selectedConv)) || []).map((m:any)=> (
                <div key={m.id_detalle_mensajes} className="p-2 rounded-md bg-muted/30">
                  <div className="text-xs text-muted-foreground">{m.fecha_envio ? new Date(m.fecha_envio).toLocaleString() : ''}</div>
                  <div className="mt-1 text-sm">{m.mensaje}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input disabled placeholder="Enviar mensaje (no habilitado)" className="flex-1 px-3 py-2 rounded-lg bg-background border border-input" />
              <button disabled className="px-3 py-2 bg-primary text-primary-foreground rounded-md">Enviar</button>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
