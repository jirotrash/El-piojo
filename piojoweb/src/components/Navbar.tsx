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
import useMensajesMutations from "@/pages/Dashboard/hooks/useMensajesMutations";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";

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
  const [readMap, setReadMap] = useState<Record<string, boolean>>({});
  const [openChatWindow, setOpenChatWindow] = useState(false);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);

  const { theme, toggleTheme } = useTheme();
  const { token, user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const { data: usuariosData = [], refetch: refetchUsuarios } = useUsuarioApi(1, 10000);
  const { data: conversacionesData = [], refetch: refetchConvs } = useConversacionesApi();
  const { data: mensajesData = [], refetch: refetchMensajes } = useDetalleMensajesApi();
  const { createDetalleMensaje } = useMensajesMutations();

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
    if (authUser) return authUser;
    if (!usuariosData || usuariosData.length === 0) return null;
    if (tokenSub) {
      const byId = usuariosData.find((u: any) => String(u.id_usuarios ?? u.id) === String(tokenSub));
      if (byId) return byId;
    }
    if (tokenEmail) {
      const byEmail = usuariosData.find((u: any) => (u.email || '').toLowerCase() === tokenEmail?.toLowerCase());
      if (byEmail) return byEmail;
    }
    return null;
  }, [usuariosData, tokenEmail, tokenSub, authUser]);

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
    const k = String(m.conversacion?.id_conversaciones ?? m.id_conversaciones ?? '');
    if (!k) return;
    if (!lastMessageByConv[k] || new Date(m.fecha_envio) > new Date(lastMessageByConv[k].fecha_envio)) {
      lastMessageByConv[k] = m;
    }
  });

  const timeAgoShort = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const convItems = (userConversations || []).map((c: any) => ({
    conv: c,
    last: lastMessageByConv[String(c.id_conversaciones)] || null,
  })).sort((a: any, b: any) => {
    const ta = a.last ? new Date(a.last.fecha_envio).getTime() : 0;
    const tb = b.last ? new Date(b.last.fecha_envio).getTime() : 0;
    return tb - ta;
  });

  const unreadCount = convItems.reduce((acc: number, it: any) => {
    const last = it.last;
    if (!last) return acc;
    const meId = String(currentUser?.id_usuarios ?? currentUser?.id ?? '');
    const fromId = String(last.id_emisor ?? last.emisor?.id_usuarios ?? last.emisor ?? '');
    const isUnread = fromId && fromId !== meId && !readMap[String(it.conv.id_conversaciones)];
    return acc + (isUnread ? 1 : 0);
  }, 0);

  const messagesForActive = (() => {
    if (activeConvId == null) return [] as any[];

    const server = (mensajesData || []).filter((m: any) => String(m.conversacion?.id_conversaciones ?? m.id_conversaciones ?? '') === String(activeConvId))
      .map((m: any) => ({
        id: m.id_detalle_mensajes,
        text: m.mensaje,
        from: String(m.emisor?.id_usuarios ?? m.id_emisor) === String(currentUser?.id_usuarios ?? currentUser?.id) ? 'user' : 'seller',
        senderId: m.emisor?.id_usuarios ?? m.id_emisor ?? null,
        senderName: m.emisor?.nombre ?? null,
        createdAt: m.fecha_envio ?? null,
      }));

    // try localStorage fallback for conversations that were created locally
    let local: any[] = [];
    try {
      const conv = (conversacionesData || []).find((c: any) => String(c.id_conversaciones) === String(activeConvId));
      if (conv) {
        const pubId = conv.publicacion?.id_publicaciones ?? conv.publicacion?.id ?? null;
        const sellerId = conv.vendedor?.id_usuarios ?? conv.vendedor?.id ?? conv.id_vendedor ?? null;
        const userId = currentUser?.id_usuarios ?? currentUser?.id ?? 'anon';
        const key = `local_conv_pub_${pubId}_u${userId}_s${sellerId ?? ''}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            local = arr.map((m: any) => {
              const id = m.id ?? m.id_detalle_mensajes ?? `local_${String(m.senderId ?? Date.now())}_${Math.random()}`;
              const text = m.mensaje ?? m.text ?? String(m);
              const senderId = m.senderId ?? m.id_emisor ?? (m.from === 'user' ? userId : sellerId) ?? null;
              const senderName = m.senderName ?? (m.from === 'user' ? (currentUser?.nombre ?? currentUser?.email ?? 'Tú') : (conv.vendedor?.nombre ?? conv.comprador?.nombre ?? null));
              const from = String(senderId) === String(userId) ? 'user' : 'seller';
              const createdAt = m.createdAt ?? m.fecha_envio ?? null;
              return { id, text, from, senderId, senderName, createdAt };
            }).filter(Boolean);
          }
        }
      }
    } catch (e) {
      // ignore localStorage errors
    }

    // combine and dedupe by id (prefer server items)
    const combined = [...server, ...local];
    const map = new Map<string, any>();
    for (const msg of combined) {
      const key = String(msg.id ?? `${msg.text}_${msg.createdAt}`);
      if (!map.has(key)) map.set(key, msg);
    }
    const out = Array.from(map.values()).sort((a: any, b: any) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return ta - tb;
    });
    return out;
  })();

  const handleSendInChat = async (text: string) => {
    if (!activeConvId || !currentUser) return;
    try {
      await createDetalleMensaje({ id_conversaciones: Number(activeConvId), id_emisor: Number(currentUser?.id_usuarios ?? currentUser?.id), mensaje: text });
      try {
        await Promise.all([
          refetchMensajes && refetchMensajes(),
          refetchConvs && refetchConvs(),
          refetchUsuarios && refetchUsuarios(),
        ]);
      } catch (err) {
        // ignore
      }
    } catch (e) {
      // fallback: do nothing (messages will sync on refetch)
    }
  };

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
                  {unreadCount > 0 ? (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
                  ) : userConversations.length ? (
                    <span className="w-2 h-2 bg-slate-400 rounded-full" />
                  ) : null}
                </button>

                {openMessages && (
                  <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-2 z-40">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                      <div className="text-sm font-semibold">Mensajes</div>
                      <button onClick={() => {
                        const map: Record<string, boolean> = {};
                        convItems.forEach((it: any) => { map[String(it.conv.id_conversaciones)] = true; });
                        setReadMap(map);
                      }} className="text-xs text-primary hover:underline">Marcar todos como leídos</button>
                    </div>

                    <div className="max-h-64 overflow-auto">
                      {convItems.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-muted-foreground">No tienes conversaciones</div>
                      ) : (
                        convItems.map((it: any) => {
                          const c = it.conv;
                          const last = it.last;
                          // determine peer user (the other participant)
                          const meId = String(currentUser?.id_usuarios ?? currentUser?.id ?? '');
                          const vendedorId = String(c.vendedor?.id_usuarios ?? c.vendedor?.id ?? c.id_vendedor ?? '');
                          const compradorId = String(c.comprador?.id_usuarios ?? c.comprador?.id ?? c.id_comprador ?? '');
                          let peerUser: any = null;

                          // Prefer the last message's emisor if it isn't the current user
                          const lastEmisorId = last?.emisor?.id_usuarios ? String(last.emisor.id_usuarios) : (last?.id_emisor ? String(last.id_emisor) : null);
                          if (lastEmisorId && lastEmisorId !== meId) {
                            peerUser = last.emisor || (usuariosData || []).find((u: any) => String(u.id_usuarios ?? u.id) === lastEmisorId) || null;
                          }

                          // If no peer from last message, choose the other conversation participant
                          if (!peerUser) {
                            if (vendedorId && vendedorId !== meId) peerUser = c.vendedor ?? (usuariosData || []).find((u: any) => String(u.id_usuarios ?? u.id) === vendedorId);
                            else if (compradorId && compradorId !== meId) peerUser = c.comprador ?? (usuariosData || []).find((u: any) => String(u.id_usuarios ?? u.id) === compradorId);
                          }

                          // fallback: try last.emisor even if equals me, or usuariosData lookup
                          if (!peerUser) {
                            if (last?.emisor) peerUser = last.emisor;
                            else {
                              const fallbackId = vendedorId || compradorId || '';
                              peerUser = (usuariosData || []).find((u: any) => String(u.id_usuarios ?? u.id) === fallbackId) || null;
                            }
                          }

                          const name = peerUser?.nombre ?? last?.emisor?.nombre ?? `Usuario`;
                          const avatar = avatarSrc(peerUser?.foto_perfil ?? last?.emisor?.foto_perfil);
                          const isUnread = last && String(last.id_emisor ?? last.emisor?.id_usuarios ?? '') !== meId && !readMap[String(c.id_conversaciones)];

                          return (
                            <button key={c.id_conversaciones} onClick={() => { setActiveConvId(Number(c.id_conversaciones)); setOpenChatWindow(true); setOpenMessages(false); setReadMap(prev => ({ ...prev, [String(c.id_conversaciones)]: true })); try { refetchMensajes && refetchMensajes(); refetchConvs && refetchConvs(); } catch {} }} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md">
                              <div className="relative flex-shrink-0">
                                {avatar ? (
                                  <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold">{String(name)?.[0] ?? '?'}</div>
                                )}
                                {isUnread && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-card" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium truncate">{name}</div>
                                  <div className="text-xs text-muted-foreground ml-2">{timeAgoShort(last?.fecha_envio)}</div>
                                </div>
                                <div className="text-xs text-muted-foreground truncate mt-1">{last?.mensaje ? String(last.mensaje).slice(0, 60) : 'Envíaste una publicación'}</div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div className="px-3 py-2 border-t border-border">
                      <button onClick={() => { setOpenChatWindow(true); setOpenMessages(false); setActiveConvId(null); }} className="w-full text-center text-sm text-primary font-semibold">Ver todos los mensajes</button>
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

      {/* centered messages modal removed; using floating chat window instead */}

      {/* Floating chat window: cuando openChatWindow=true mostramos lista o conversación activa */}
      {openChatWindow && (
        <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-card border border-border rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <div className="font-semibold">Mensajes</div>
            <div className="flex-1" />
            <button onClick={() => { setOpenChatWindow(false); setActiveConvId(null); }} className="text-sm text-muted-foreground">✕</button>
          </div>
          <div className="h-72 overflow-auto">
            {activeConvId == null ? (
              convItems.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No tienes conversaciones</div>
              ) : (
                <div className="divide-y divide-border">
                  {convItems.map((it: any) => {
                    const c = it.conv;
                    const last = it.last;
                    const meId = String(currentUser?.id_usuarios ?? currentUser?.id ?? '');
                    const vendedorId = String(c.vendedor?.id_usuarios ?? c.vendedor?.id ?? c.id_vendedor ?? '');
                    const compradorId = String(c.comprador?.id_usuarios ?? c.comprador?.id ?? c.id_comprador ?? '');
                    let peerUser: any = null;

                    const lastEmisorId = last?.emisor?.id_usuarios ? String(last.emisor.id_usuarios) : (last?.id_emisor ? String(last.id_emisor) : null);
                    if (lastEmisorId && lastEmisorId !== meId) {
                      peerUser = last.emisor || (usuariosData || []).find((u: any) => String(u.id_usuarios ?? u.id) === lastEmisorId) || null;
                    }

                    if (!peerUser) {
                      if (vendedorId && vendedorId !== meId) peerUser = c.vendedor ?? (usuariosData || []).find((u: any) => String(u.id_usuarios ?? u.id) === vendedorId);
                      else if (compradorId && compradorId !== meId) peerUser = c.comprador ?? (usuariosData || []).find((u: any) => String(u.id_usuarios ?? u.id) === compradorId);
                    }

                    if (!peerUser) {
                      if (last?.emisor) peerUser = last.emisor;
                      else {
                        const fallbackId = vendedorId || compradorId || '';
                        peerUser = (usuariosData || []).find((u: any) => String(u.id_usuarios ?? u.id) === fallbackId) || null;
                      }
                    }

                    const name = peerUser?.nombre ?? last?.emisor?.nombre ?? `Usuario`;
                    const avatar = avatarSrc(peerUser?.foto_perfil ?? last?.emisor?.foto_perfil);

                    return (
                      <button key={c.id_conversaciones} onClick={() => { setActiveConvId(Number(c.id_conversaciones)); setReadMap(prev => ({ ...prev, [String(c.id_conversaciones)]: true })); try { refetchMensajes && refetchMensajes(); refetchConvs && refetchConvs(); } catch {} }} className="w-full text-left px-3 py-3 hover:bg-muted rounded-md flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {avatar ? (
                            <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold">{String(name)?.[0] ?? '?'}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{name}</div>
                          <div className="text-xs text-muted-foreground truncate">{last?.mensaje ? String(last.mensaje).slice(0, 80) : 'Envíaste una publicación'}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{timeAgoShort(last?.fecha_envio)}</div>
                      </button>
                    );
                  })}
                </div>
              )
            ) : (
              (() => {
                const activeConv = convItems.find((it: any) => String(it.conv.id_conversaciones) === String(activeConvId));
                  if (!messagesForActive || messagesForActive.length === 0) {
                  return (
                    <div className="p-4 text-sm text-muted-foreground">
                      {activeConv ? (
                        (() => {
                          const ac = activeConv.conv;
                          const al = activeConv.last;
                          const meId = String(currentUser?.id_usuarios ?? currentUser?.id ?? '');
                          const vendedorId = String(ac.vendedor?.id_usuarios ?? ac.vendedor?.id ?? ac.id_vendedor ?? '');
                          const compradorId = String(ac.comprador?.id_usuarios ?? ac.comprador?.id ?? ac.id_comprador ?? '');
                          let peerName = null;
                          const lastEmisorId = al?.emisor?.id_usuarios ? String(al.emisor.id_usuarios) : (al?.id_emisor ? String(al.id_emisor) : null);
                          if (lastEmisorId && lastEmisorId !== meId) peerName = al.emisor?.nombre ?? null;
                          if (!peerName) {
                            if (vendedorId && vendedorId !== meId) peerName = ac.vendedor?.nombre ?? null;
                            else if (compradorId && compradorId !== meId) peerName = ac.comprador?.nombre ?? null;
                          }
                          if (!peerName) peerName = al?.emisor?.nombre ?? 'Conversación';
                          return (
                            <>
                              <div className="font-medium mb-1">{peerName}</div>
                              <div className="text-xs">{(al?.mensaje ? String(al.mensaje) : 'Aún no hay mensajes en esta conversación')}</div>
                            </>
                          );
                        })()
                      ) : (
                        <div>No hay mensajes</div>
                      )}
                    </div>
                  );
                }
                return <MessageList messages={messagesForActive} currentUserId={currentUser?.id_usuarios ?? currentUser?.id} sellerName={undefined} />;
              })()
            )}
          </div>
          <div className="p-3 border-t border-border">
            {activeConvId != null ? <ChatInput onSend={handleSendInChat} /> : null}
          </div>
        </div>
      )}
      {/* legacy centered conversation modal removed; interactions now open the floating chat window */}
    </nav>
  );
};

export default Navbar;
