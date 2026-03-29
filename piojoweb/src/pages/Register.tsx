import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, GraduationCap,
  MapPin, Camera, ArrowRight, ArrowLeft, CheckCircle2, Recycle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import useMunicipiosApi from "@/pages/Dashboard/hooks/useMunicipiosApi";
import useCarrerasApi from "@/pages/Dashboard/hooks/useCarrerasApi";
import piojoLogo from "@/assets/piojo-logo.png";
import useUsuarioMutations from "@/pages/Dashboard/hooks/useUsuarioMutations";
import { toast } from "@/hooks/use-toast";

// carreras and municipios will be loaded from the backend via hooks

const Register = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    matricula: "",
    carrera: "",
    municipio: "",
    direccion: "",
    foto_perfil: null as File | null,
  });

  // Load options from API
  const { data: municipiosData = [], loading: municipiosLoading } = useMunicipiosApi();
  const { data: carrerasData = [] } = useCarrerasApi();

  const carreraOptions = carrerasData.map((c: any) => ({ id: c.id_carreras, nombre: c.nombre }));
  const municipioOptions = municipiosData.map((m: any) => ({ id: m.id_municipios, nombre: m.nombre }));

  const update = (field: string, value: string | File | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // avatar selected
      update("foto_perfil", file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const { createUsuario } = useUsuarioMutations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form", { municipio: form.municipio, municipiosLoading, municipioOptions });
    try {
      // form state ready for submit
      // Ensure required fields are present
      if (!form.municipio || Number(form.municipio) <= 0) {
        toast({ title: "Error", description: "Selecciona un municipio" });
        return null;
      }

      // Helper: compress image using canvas and return base64 (jpeg)
      const compressImageToBase64 = (file: File, maxWidth = 1024, quality = 0.7) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              const ratio = Math.min(1, maxWidth / img.width);
              const canvas = document.createElement('canvas');
              canvas.width = Math.round(img.width * ratio);
              canvas.height = Math.round(img.height * ratio);
              const ctx = canvas.getContext('2d');
              if (!ctx) return reject(new Error('Canvas not supported'));
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', quality);
              resolve(dataUrl);
            };
            img.onerror = reject;
            img.src = String(reader.result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      let fotoPerfilBase64: string | null = null;
      if (form.foto_perfil) {
        try {
          fotoPerfilBase64 = await compressImageToBase64(form.foto_perfil);
        } catch (err) {
          // compression failed, trying fallback FileReader
          try {
            fotoPerfilBase64 = await new Promise<string>((resolve, reject) => {
              const r = new FileReader();
              r.onload = () => resolve(String(r.result));
              r.onerror = (e) => reject(e);
              r.readAsDataURL(form.foto_perfil as File);
            });
            // fallback base64 produced
          } catch (err2) {
            fotoPerfilBase64 = null;
          }
        }
      }
      const input: Record<string, any> = {
        nombre: form.nombre,
        apellido_paterno: form.apellido_paterno,
        apellido_materno: form.apellido_materno,
        email: form.email,
        password: form.password,
        telefono: form.telefono || null,
        matricula: form.matricula || null,
        direccion: form.direccion || null,
        foto_perfil: fotoPerfilBase64,
        id_carreras: form.carrera ? Number(form.carrera) : null,
        id_municipios: form.municipio ? Number(form.municipio) : null,
      };

      // sending input

      const created = await createUsuario(input);

      // createUsuario returned

      toast({ title: "Cuenta creada", description: "Tu cuenta fue creada correctamente. Por favor inicia sesión." });
      // redirect to login
      window.location.href = "/login";
      return created;
    } catch (err: any) {
      toast({ title: "Error", description: err?.message ?? "No se pudo crear la cuenta" });
      return null;
    }
  };

  const canGoNext = () => {
    if (step === 1) return form.nombre && form.apellido_paterno && form.email;
    if (step === 2) return form.password && form.password === form.confirmPassword;
    return true;
  };

  const totalSteps = 3;

  const inputClass =
    "w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body text-sm transition-colors";

  const selectClass =
    "w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body text-sm transition-colors appearance-none";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-donate opacity-10 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-fun opacity-10 blur-3xl" />

      <Link
        to="/"
        className="absolute top-4 left-4 p-2 rounded-full bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors z-10"
        aria-label="Volver al inicio"
      >
        <ArrowLeft size={18} />
      </Link>

      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors z-10"
        aria-label="Cambiar tema"
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <div className="bg-card rounded-3xl shadow-card border border-border p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <Link to="/" className="flex items-center gap-3 mb-3">
              <img src={piojoLogo} alt="Piojo logo" className="h-12 w-12 rounded-full object-cover shadow-lg" />
              <div>
                <h1 className="font-display text-2xl font-bold text-primary">PIOJO</h1>
                <span className="text-xs font-body text-muted-foreground">2da mano</span>
              </div>
            </Link>
            <h2 className="font-display text-xl font-bold text-foreground">Crea tu cuenta</h2>
            <p className="text-muted-foreground text-sm mt-1 font-body">Únete a la comunidad de moda circular 🌎</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    s <= step ? "bg-gradient-hero" : "bg-muted"
                  }`}
                />
              </div>
            ))}
            <span className="text-xs text-muted-foreground font-body ml-2">{step}/{totalSteps}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <p className="text-sm font-display font-bold text-foreground mb-3">📝 Datos personales</p>

                  {/* Avatar */}
                  <div className="flex justify-center mb-2">
                    <label className="relative cursor-pointer group">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden bg-muted group-hover:border-primary transition-colors">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                        <Camera size={12} />
                      </div>
                      <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground font-body">Nombre *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input type="text" value={form.nombre} onChange={(e) => update("nombre", e.target.value)} placeholder="Juan" className={inputClass} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground font-body">Ap. Paterno *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input type="text" value={form.apellido_paterno} onChange={(e) => update("apellido_paterno", e.target.value)} placeholder="Pérez" className={inputClass} required />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground font-body">Ap. Materno</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input type="text" value={form.apellido_materno} onChange={(e) => update("apellido_materno", e.target.value)} placeholder="López" className={inputClass} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground font-body">Teléfono</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input type="tel" value={form.telefono} onChange={(e) => update("telefono", e.target.value)} placeholder="961 123 4567" className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground font-body">Correo electrónico *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="tu@universidad.edu.mx" className={inputClass} required />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <p className="text-sm font-display font-bold text-foreground mb-3">🔒 Seguridad</p>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground font-body">Contraseña *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className={inputClass}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground font-body">Confirmar contraseña *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => update("confirmPassword", e.target.value)}
                        placeholder="Repite tu contraseña"
                        className={inputClass}
                        required
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-destructive text-xs font-body">Las contraseñas no coinciden</p>
                  )}

                  {/* Password strength */}
                  {form.password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              form.password.length >= i * 3
                                ? i <= 2 ? "bg-destructive" : "bg-primary"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { test: form.password.length >= 8, label: "8+ caracteres" },
                          { test: /[A-Z]/.test(form.password), label: "Mayúscula" },
                          { test: /[0-9]/.test(form.password), label: "Número" },
                          { test: /[^A-Za-z0-9]/.test(form.password), label: "Especial" },
                        ].map((r) => (
                          <span key={r.label} className={`text-xs font-body flex items-center gap-1 ${r.test ? "text-primary" : "text-muted-foreground"}`}>
                            <CheckCircle2 size={12} /> {r.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <p className="text-sm font-display font-bold text-foreground mb-3">🎓 Info universitaria</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground font-body">Matrícula</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input type="text" value={form.matricula} onChange={(e) => update("matricula", e.target.value)} placeholder="221B0001" className={inputClass} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground font-body">Carrera</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <select value={form.carrera} onChange={(e) => update("carrera", e.target.value)} className={selectClass}>
                          <option value="">Selecciona carrera</option>
                          {carreraOptions.map((c) => (
                            <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground font-body">Municipio</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <select value={form.municipio} onChange={(e) => update("municipio", e.target.value)} className={selectClass}>
                        <option value="">{municipiosLoading ? "Cargando municipios..." : "Selecciona municipio"}</option>
                        {!municipiosLoading && municipioOptions.map((m) => (
                          <option key={m.id} value={String(m.id)}>{m.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground font-body">Dirección</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-muted-foreground" size={18} />
                      <textarea
                        value={form.direccion}
                        onChange={(e) => update("direccion", e.target.value)}
                        placeholder="Calle, colonia, número..."
                        rows={2}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body text-sm transition-colors resize-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 rounded-xl border border-input bg-background text-foreground font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                >
                  <ArrowLeft size={16} />
                  Atrás
                </button>
              )}

              {step < totalSteps ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  disabled={!canGoNext()}
                  onClick={() => setStep(step + 1)}
                  className="flex-1 py-3 rounded-xl bg-gradient-hero text-primary-foreground font-display font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ArrowRight size={16} />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={municipiosLoading || municipioOptions.length === 0}
                  className="flex-1 py-3 rounded-xl bg-gradient-warm text-secondary-foreground font-display font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Recycle size={16} />
                  Crear Cuenta
                </motion.button>
              )}
            </div>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground mt-6 font-body">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
