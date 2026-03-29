import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, GraduationCap, MapPin, Edit2, Package, ShoppingBag, Heart, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import piojoLogo from "@/assets/piojo-logo.png";
import useUsuarioApi from "./Dashboard/hooks/useUsuarioApi";
import useUsuarioMutations from "./Dashboard/hooks/useUsuarioMutations";
import { toast } from "@/hooks/use-toast";
import usePublicacionesApi from "./Dashboard/hooks/usePublicacionesApi";
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
  const { token, logout } = useAuth();
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

  // Determine current user: prefer match by email, otherwise first user, otherwise null
  const currentUser = (() => {
    if (usuariosLoading) return null;
    // Prefer exact id match from token.sub if available
    if (tokenSub) {
      const byId = usuariosData.find((u: any) => String(u.id_usuarios ?? u.id) === String(tokenSub));
      if (byId) return byId;
    }
    if (tokenEmail) {
      const byEmail = usuariosData.find((u: any) => (u.email || '').toLowerCase() === tokenEmail?.toLowerCase());
      if (byEmail) return byEmail;
    }
    return usuariosData.length ? usuariosData[0] : null;
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
          {(activeTab === "published" ? userProducts : userProducts.filter((p: any) => !p.disponible)).map((product: any, i: number) => {
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
                <div className={`h-28 bg-gradient-to-br ${gradient} flex items-center justify-center text-4xl` }>
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
    </div>
  );
};

export default Profile;
