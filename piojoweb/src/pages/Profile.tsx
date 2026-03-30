import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, GraduationCap, MapPin, Edit2, Package, ShoppingBag, Heart, Settings, LogOut, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import piojoLogo from "@/assets/piojo-logo.png";
import useUsuarioApi from "./Dashboard/hooks/useUsuarioApi";
import useUsuarioMutations from "./Dashboard/hooks/useUsuarioMutations";
import { toast } from "@/hooks/use-toast";
import usePublicacionesApi from "./Dashboard/hooks/usePublicacionesApi";
import useHistorialTratosApi from "./Dashboard/hooks/useHistorialTratosApi";
import { useAuth } from "@/components/AuthProvider";

const statusColor: Record<string, string> = {
  Disponible: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Vendido: "bg-muted text-muted-foreground",
  Reservado: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const Profile = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"published" | "bought">("published");

  const { data: usuariosData = [], loading: usuariosLoading, refetch: refetchUsuarios } = useUsuarioApi();
  const { data: publicacionesData = [], loading: publicacionesLoading } = usePublicacionesApi();
  const { data: historialData = [], refetch: refetchHistorial } = useHistorialTratosApi();
  const { token, user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  // Derive user identity from token.
  // Supports two token shapes:
  // - legacy mock token: `btoa(email:timestamp)`
  // - JWT token: header.payload.signature
  let tokenEmail: string | null = null;
  let tokenSub: string | null = null;
  if (token) {
    try {
      // JWT detection: contains two dots
      if ((token.match(/\./g) || []).length === 2) {
        const parts = token.split('.');
        const payload = parts[1];
        // base64url -> base64
        const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
        const json = atob(b64 + pad);
        const obj = JSON.parse(json);
        tokenEmail = obj.email || null;
        tokenSub = obj.sub ? String(obj.sub) : null;
      } else {
        // fallback mock token
        const decoded = atob(token);
        const p = decoded.split(":");
        if (p && p[0] && p[0].includes("@")) tokenEmail = p[0];
      }
    } catch (e) {
      tokenEmail = null;
      tokenSub = null;
    }
  }

  // Determine current user: prefer authUser, then token match; do NOT fallback to first user
  const currentUser = (() => {
    if (usuariosLoading) return null;
    if (authUser) return authUser;
    // Prefer exact id match from token.sub if available
    if (tokenSub) {
      const byId = usuariosData.find((u: any) => String(u.id_usuarios ?? u.id) === String(tokenSub));
      if (byId) return byId;
    }
    if (tokenEmail) {
      const byEmail = usuariosData.find((u: any) => (u.email || '').toLowerCase() === tokenEmail?.toLowerCase());
      if (byEmail) return byEmail;
    }
    return null;
  })();

  // Edit mode state
  const { updateUsuario } = useUsuarioMutations();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountForm, setAccountForm] = useState<{ email: string; currentPassword: string; newPassword: string }>({ email: '', currentPassword: '', newPassword: '' });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({ nombre: '', apellido_paterno: '', apellido_materno: '', email: '', telefono: '', matricula: '', direccion: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewLocal, setAvatarPreviewLocal] = useState<string | null>(null);

  const startEdit = () => {
    if (!currentUser) return;
    setEditForm({
      nombre: currentUser.nombre ?? '',
      apellido_paterno: currentUser.apellido_paterno ?? '',
      apellido_materno: currentUser.apellido_materno ?? '',
      email: currentUser.email ?? '',
      telefono: currentUser.telefono ?? '',
      matricula: currentUser.matricula ?? '',
      direccion: currentUser.direccion ?? '',
    });
    setAvatarPreviewLocal(normalizeFotoPerfil(currentUser.foto_perfil));
    setEditing(true);
  };

  // Account modal handlers
  const openAccountModal = () => {
    setAccountForm((p) => ({
      email: currentUser?.email ?? '',
      currentPassword: '',
      newPassword: '',
    }));
    setShowAccountModal(true);
  };

  const saveAccountSettings = async () => {
    if (!currentUser) return;
    try {
      // Update email if changed
      if (accountForm.email && accountForm.email !== (currentUser.email ?? '')) {
        await updateUsuario(Number(currentUser.id_usuarios ?? currentUser.id), { email: accountForm.email });
        toast({ title: 'Email actualizado', description: 'Se actualizó tu dirección de correo.' });
      }

      // Update password if provided (backend should handle hashing)
      if (accountForm.newPassword) {
        await updateUsuario(Number(currentUser.id_usuarios ?? currentUser.id), { password: accountForm.newPassword });
        toast({ title: 'Contraseña cambiada', description: 'Tu contraseña fue actualizada.' });
      }



      setShowAccountModal(false);
      await refetchUsuarios();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message ?? 'No se pudo actualizar la configuración' });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setAvatarFile(f);
    if (f) {
      const r = new FileReader();
      r.onload = () => setAvatarPreviewLocal(String(r.result));
      r.readAsDataURL(f);
    }
  };

  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const saveEdit = async () => {
    if (!currentUser) return;
    try {
      let foto = currentUser.foto_perfil ?? null;
      if (avatarFile) {
        foto = await fileToBase64(avatarFile);
      }
      const input: Record<string, any> = {
        nombre: editForm.nombre,
        telefono: editForm.telefono ?? null,
        direccion: editForm.direccion ?? null,
        foto_perfil: foto,
      };
      const updated = await updateUsuario(Number(currentUser.id_usuarios ?? currentUser.id), input);
      toast({ title: 'Perfil actualizado', description: 'Tus cambios se guardaron correctamente.' });
      setEditing(false);
      await refetchUsuarios();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message ?? 'No se pudo actualizar el perfil' });
    }
  };

  const userProducts = publicacionesData.filter((p: any) => currentUser ? Number(p.id_usuarios) === Number(currentUser.id_usuarios ?? currentUser.id) : false);
  // Purchases stored in localStorage by ProductDetail after a successful buy
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  useEffect(() => {
    if (!currentUser) return;
    const userId = Number(currentUser.id_usuarios ?? currentUser.id);
    try {
      const raw = localStorage.getItem(`purchases_${userId}`);
      setPurchasedItems(raw ? JSON.parse(raw) : []);
    } catch (_) { setPurchasedItems([]); }
  }, [currentUser]);

  // Local historial (fallback when backend mutation is not available)
  const [localHistorial, setLocalHistorial] = useState<any[]>([]);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [finalForm, setFinalForm] = useState<{ calificacion: number; comentario: string; titulo_producto: string }>({ calificacion: 5, comentario: '', titulo_producto: '' });
  const [starHover, setStarHover] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('local_historial_tratos');
      if (raw) setLocalHistorial(JSON.parse(raw));
    } catch (e) {
      setLocalHistorial([]);
    }
  }, []);

  const saveFinalizacionLocal = async () => {
    const item = {
      id_historial_tratos: `local_${Date.now()}`,
      fecha_cierre: new Date().toISOString(),
      calificacion: finalForm.calificacion,
      comentario: finalForm.comentario,
      titulo_producto: finalForm.titulo_producto,
    };
    const next = [item, ...localHistorial];
    try {
      localStorage.setItem('local_historial_tratos', JSON.stringify(next));
    } catch (e) {}
    setLocalHistorial(next);
    setShowFinalModal(false);
    try { await refetchHistorial(); } catch {}
  };
  
  function formatDate(value: any) {
    if (!value) return '—';
    try {
      // Handle numeric timestamps and ISO strings
      const d = typeof value === 'number' || String(value).match(/^\d+$/) ? new Date(Number(value)) : new Date(String(value));
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString();
    } catch (e) { return '—'; }
  }

  function normalizeFotoPerfil(src: any) {
    if (!src) return null;
    try {
      const s = String(src).trim();
      if (s.startsWith('data:')) return s;
      if (s.startsWith('http://') || s.startsWith('https://')) return s;

      // If it's a JSON string containing the image
      if (s.startsWith('{')) {
        try {
          const obj = JSON.parse(s);
          if (obj) {
            if (obj.data) return normalizeFotoPerfil(obj.data);
            if (obj.image) return normalizeFotoPerfil(obj.image);
            if (obj.base64) return normalizeFotoPerfil(obj.base64);
          }
        } catch (e) {
          // fallthrough
        }
      }

      // Remove data: prefix if present accidentally
      const maybeB64 = s.replace(/^data:.*;base64,/, '').replace(/\s+/g, '');
      // Sanitize URL-safe base64
      const safeB64 = maybeB64.replace(/-/g, '+').replace(/_/g, '/');

      // Quick length check to consider as base64
      if (safeB64.length < 50) return s;

      // Try to peek decoded bytes to detect mime
      try {
        const peek = safeB64.slice(0, 64);
        const bin = atob(peek + '='.repeat((4 - (peek.length % 4)) % 4));
        const codes = Array.from(bin).slice(0, 8).map((ch) => ch.charCodeAt(0));
        // JPEG: 0xFF 0xD8
        if (codes[0] === 0xff && codes[1] === 0xd8) return `data:image/jpeg;base64,${safeB64}`;
        // PNG: 0x89 'P' 'N' 'G'
        if (codes[0] === 0x89 && codes[1] === 0x50 && codes[2] === 0x4e && codes[3] === 0x47) return `data:image/png;base64,${safeB64}`;
        // GIF: 'G' 'I' 'F'
        if (codes[0] === 0x47 && codes[1] === 0x49 && codes[2] === 0x46) return `data:image/gif;base64,${safeB64}`;
        // WebP: 'R' 'I' 'F' 'F' and later 'W' 'E' 'B' 'P' (harder to detect from peek) - fallback to webp if contains 'RIFF'
        const asciiPeek = bin.slice(0, 12);
        if (asciiPeek.includes('RIFF') && asciiPeek.includes('WEBP')) return `data:image/webp;base64,${safeB64}`;
        // SVG: decoded starts with '<'
        if (bin.trim().startsWith('<')) return `data:image/svg+xml;base64,${safeB64}`;
      } catch (e) {
        // atob may fail; continue to fallback
      }

      // Fallback: assume jpeg
      return `data:image/jpeg;base64,${safeB64}`;
    } catch (e) {
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/" className="p-2 rounded-full bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <Link to="/" className="flex items-center gap-2">
          <img src={piojoLogo} alt="Piojo" className="h-8 w-8 rounded-full object-cover" />
          <span className="font-display font-bold text-primary text-lg">PIOJO</span>
        </Link>
        <button onClick={toggleTheme} className="p-2 rounded-full bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl border border-border shadow-card p-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl shrink-0">
              {normalizeFotoPerfil(currentUser?.foto_perfil) ? (
                <img src={normalizeFotoPerfil(currentUser?.foto_perfil)} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {!editing ? (
                  <>
                    <h1 className="font-display text-xl font-bold text-foreground truncate">{currentUser ? `${currentUser.nombre} ${currentUser.apellido_paterno ?? ''} ${currentUser.apellido_materno ?? ''}` : 'Usuario'}</h1>
                    <button onClick={startEdit} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0">
                      <Edit2 size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={editForm.nombre} placeholder="Nombre" onChange={(e) => setEditForm((p:any)=>({...p,nombre:e.target.value}))} className="w-full pl-3 pr-3 py-2 rounded-lg bg-background border border-input text-foreground" />
                      <input value={editForm.apellido_paterno} placeholder="Apellido paterno" onChange={(e) => setEditForm((p:any)=>({...p,apellido_paterno:e.target.value}))} className="w-full pl-3 pr-3 py-2 rounded-lg bg-background border border-input text-foreground" />
                      <input value={editForm.apellido_materno} placeholder="Apellido materno" onChange={(e) => setEditForm((p:any)=>({...p,apellido_materno:e.target.value}))} className="w-full pl-3 pr-3 py-2 rounded-lg bg-background border border-input text-foreground" />
                      <input value={editForm.email} placeholder="Email" onChange={(e) => setEditForm((p:any)=>({...p,email:e.target.value}))} className="w-full pl-3 pr-3 py-2 rounded-lg bg-background border border-input text-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={editForm.telefono} placeholder="Teléfono" onChange={(e) => setEditForm((p:any)=>({...p,telefono:e.target.value}))} className="w-full pl-3 pr-3 py-2 rounded-lg bg-background border border-input text-foreground" />
                      <input value={editForm.matricula} placeholder="Matrícula" readOnly disabled className="w-full pl-3 pr-3 py-2 rounded-lg bg-muted text-muted-foreground border border-input" />
                    </div>
                    <textarea value={editForm.direccion} placeholder="Dirección" onChange={(e) => setEditForm((p:any)=>({...p,direccion:e.target.value}))} className="w-full pl-3 pr-3 py-2 rounded-lg bg-background border border-input text-foreground" />
                    <div className="flex items-center gap-2">
                      <input type="file" accept="image/*" onChange={handleAvatarChange} />
                      {avatarPreviewLocal ? <img src={avatarPreviewLocal} alt="preview" className="w-12 h-12 object-cover rounded-md" /> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={saveEdit} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg">Guardar</button>
                      <button onClick={()=>setEditing(false)} className="px-3 py-2 bg-muted text-foreground rounded-lg">Cancelar</button>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground font-body flex items-center gap-1.5 mt-1">
                <Mail size={14} /> {currentUser?.email ?? '—'}
              </p>
              <p className="text-sm text-muted-foreground font-body flex items-center gap-1.5 mt-0.5">
                <GraduationCap size={14} /> {currentUser?.telefono ?? '—'}
              </p>
              <p className="text-sm text-muted-foreground font-body flex items-center gap-1.5 mt-0.5">
                <MapPin size={14} /> {currentUser?.direccion ?? '—'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground font-body">
            <span className="bg-muted px-2.5 py-1 rounded-full font-semibold">{currentUser?.matricula ?? '—'}</span>
            <span>·</span>
            <span>Miembro desde {formatDate(currentUser?.fecha_registro)}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Publicados", value: userProducts.length, icon: Package },
              { label: "Vendidos", value: userProducts.filter((p: any) => !p.disponible).length, icon: ShoppingBag },
              { label: "Comprados", value: 0, icon: Heart },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted/50 rounded-2xl p-3 text-center">
                <stat.icon size={18} className="mx-auto text-primary mb-1" />
                <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Finalizaciones (historial de tratos) */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
          {/* Section header */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-transparent px-5 py-4 border-b border-border flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                <CheckCircle2 size={17} className="text-primary" /> Pedidos Finalizados
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Historial de tratos y calificaciones</p>
            </div>
            <button
              onClick={() => { setFinalForm({ calificacion: 5, comentario: '', titulo_producto: '' }); setStarHover(0); setShowFinalModal(true); }}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-sm shrink-0"
            >
              <Star size={13} /> Calificar pedido
            </button>
          </div>

          <div className="p-4 space-y-3">
            {((historialData || []).concat(localHistorial || [])).length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
                <CheckCircle2 size={40} className="opacity-15" />
                <p className="text-sm">Aún no hay pedidos finalizados</p>
                <p className="text-xs opacity-60">Cuando completes una venta, aparecerá aquí</p>
              </div>
            ) : (
              (historialData || []).concat(localHistorial || []).slice(0, 8).map((h: any, idx: number) => {
                const stars = Number(h.calificacion ?? 0);
                const starColor = stars >= 4 ? 'text-emerald-400' : stars === 3 ? 'text-amber-400' : 'text-red-400';
                const bgBorder = stars >= 4 ? 'border-emerald-500/20 bg-emerald-500/5' : stars === 3 ? 'border-amber-500/20 bg-amber-500/5' : stars > 0 ? 'border-red-500/20 bg-red-500/5' : 'border-border bg-muted/30';
                return (
                  <div key={h.id_historial_tratos ?? `local_${idx}`} className={`rounded-2xl border ${bgBorder} p-4 transition-shadow hover:shadow-sm`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {h.titulo_producto && (
                          <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                            <Package size={11} className="opacity-60" /> {h.titulo_producto}
                          </div>
                        )}
                        <div className="flex items-center gap-0.5 mb-2">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} size={15} className={n <= stars ? `${starColor} fill-current` : 'text-muted-foreground/25'} />
                          ))}
                          <span className="ml-2 text-xs text-muted-foreground font-semibold">{stars}/5</span>
                        </div>
                        {h.comentario && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{h.comentario}</p>}
                      </div>
                      <div className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 bg-muted px-2 py-0.5 rounded-full">{formatDate(h.fecha_cierre)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Botón publicar */}
        <div className="mt-4">
          <Link to="/vender">
            <Button className="w-full bg-primary hover:bg-primary/90">Publicar un artículo</Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {["published", "bought"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2.5 rounded-xl font-display font-bold text-sm transition-colors ${
                activeTab === (tab as any)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "published" ? "Mis publicaciones" : "Mis compras"}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <motion.div layout className="grid grid-cols-2 gap-3">
          {activeTab === "published" ? userProducts.map((product: any, i: number) => {
            const status = product.disponible ? "Disponible" : "Vendido";
            const price = product.precio ?? product.price ?? 0;
            const title = product.titulo ?? product.name ?? "Sin título";
            const emoji = "👕";
            const gradient = "from-slate-400/10 to-slate-600/10";
            const fotoSrc = (() => {
              const detalles = product.detallePublicaciones || product.fotos || [];
              if (!detalles || detalles.length === 0) return null;
              const portada = detalles.find((d: any) => d.es_portada) || detalles[0];
              return normalizeFotoPerfil(portada.url_foto);
            })();
            return (
              <motion.div
                key={product.id_publicaciones ?? product.id ?? i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className={`h-28 bg-gradient-to-br ${gradient} flex items-center justify-center text-4xl`}>
                  {fotoSrc ? (
                    <img src={fotoSrc} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    emoji
                  )}
                </div>
                <div className="p-3">
                  <p className="font-body text-sm font-semibold text-foreground truncate">{title}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="font-display font-bold text-primary text-sm">${price}</span>
                    <span className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-full ${statusColor[status]}`}>
                      {status}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          }) : purchasedItems.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <ShoppingBag size={40} className="opacity-30" />
              <p className="font-body text-sm">Aún no has comprado nada</p>
            </div>
          ) : purchasedItems.map((purchase: any, i: number) => {
            const title = purchase.titulo || 'Producto';
            const price = purchase.precio ?? 0;
            const fecha = purchase.fecha ? new Date(purchase.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
            const fotoSrc = purchase.foto ? normalizeFotoPerfil(purchase.foto) : null;
            return (
              <motion.div
                key={`purchase_${purchase.id_publicaciones}_${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-28 bg-gradient-to-br from-violet-400/10 to-blue-600/10 flex items-center justify-center text-4xl">
                  {fotoSrc ? (
                    <img src={fotoSrc} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    '🛍️'
                  )}
                </div>
                <div className="p-3">
                  <p className="font-body text-sm font-semibold text-foreground truncate">{title}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="font-display font-bold text-primary text-sm">${price}</span>
                    <span className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                      Comprado
                    </span>
                  </div>
                  {fecha ? <p className="text-[10px] text-muted-foreground mt-1 font-body">{fecha}</p> : null}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Actions */}
        <div className="space-y-2 pb-8">
          <button onClick={openAccountModal} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border text-foreground font-body font-semibold text-sm hover:bg-muted transition-colors">
            <Settings size={18} className="text-muted-foreground" /> Configuración de cuenta
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-destructive/30 text-destructive font-body font-semibold text-sm hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </div>
      {showAccountModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAccountModal(false)} />
          <div className="relative w-[90%] max-w-lg bg-card border border-border rounded-xl p-4 z-60">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Configuración de cuenta</div>
              <button onClick={() => setShowAccountModal(false)} className="text-sm text-muted-foreground">Cerrar</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Email</label>
                <input value={accountForm.email} onChange={(e)=>setAccountForm(p=>({...p,email:e.target.value}))} className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-input" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Contraseña nueva</label>
                <input type="password" value={accountForm.newPassword} onChange={(e)=>setAccountForm(p=>({...p,newPassword:e.target.value}))} placeholder="Dejar vacío para no cambiar" className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-input" />
              </div>

            
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={saveAccountSettings} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg">Guardar</button>
              <button onClick={() => setShowAccountModal(false)} className="px-3 py-2 bg-muted text-foreground rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>
      ) : null}
      {showFinalModal ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowFinalModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-border"
          >
            {/* Gradient header con estrellas */}
            <div className="bg-gradient-to-br from-primary via-primary/85 to-accent/60 px-6 pt-6 pb-12 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-xl">Calificar pedido</h2>
                  <p className="text-primary-foreground/70 text-sm mt-0.5">¿Cómo resultó la transacción?</p>
                </div>
                <button
                  onClick={() => setShowFinalModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition text-sm font-bold"
                >✕</button>
              </div>

              {/* Picker de estrellas grande */}
              <div className="flex items-center justify-center gap-3 mt-6">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    onMouseEnter={() => setStarHover(n)}
                    onMouseLeave={() => setStarHover(0)}
                    onClick={() => setFinalForm(p => ({ ...p, calificacion: n }))}
                    className="transition-transform hover:scale-125 active:scale-110 focus:outline-none"
                  >
                    <Star
                      size={38}
                      className={`transition-all duration-150 ${
                        n <= (starHover || finalForm.calificacion)
                          ? 'text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.6)]'
                          : 'text-white/25'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-primary-foreground/80 text-sm mt-2 h-5">
                {['', 'Muy malo 😞', 'Malo 😕', 'Regular 😐', 'Bueno 😊', '¡Excelente! 🤩'][starHover || finalForm.calificacion]}
              </p>
            </div>

            {/* Cuerpo que sube sobre el header */}
            <div className="px-6 py-5 -mt-6 bg-card rounded-t-3xl relative space-y-4">
              {/* Selector de producto */}
              {userProducts.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Producto</label>
                  <select
                    value={finalForm.titulo_producto}
                    onChange={e => setFinalForm(p => ({ ...p, titulo_producto: e.target.value }))}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">Selecciona un producto…</option>
                    {userProducts.map((p: any) => (
                      <option key={p.id_publicaciones ?? p.id} value={p.titulo ?? p.name}>{p.titulo ?? p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Comentario */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comentario</label>
                <textarea
                  value={finalForm.comentario}
                  onChange={e => setFinalForm(p => ({ ...p, comentario: e.target.value }))}
                  placeholder="Describe cómo fue la transacción…"
                  maxLength={300}
                  rows={3}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
                <div className="text-right text-[10px] text-muted-foreground mt-0.5">{finalForm.comentario.length}/300</div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pb-1">
                <button
                  onClick={() => setShowFinalModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/70 transition-colors"
                >Cancelar</button>
                <button
                  onClick={saveFinalizacionLocal}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={15} /> Guardar calificación
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
};

export default Profile;
