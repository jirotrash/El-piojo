import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Recycle, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Sun, Moon } from "lucide-react";
import piojoLogo from "@/assets/piojo-logo.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { theme, toggleTheme } = useTheme();

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ok = await auth.login(email, password);
      if (ok) {
        navigate("/");
      } else {
        toast({ title: "Error", description: "Credenciales inválidas" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message ?? "No se pudo iniciar sesión" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-hero opacity-10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-warm opacity-10 blur-3xl" />

      {/* Theme toggle */}
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
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl shadow-card border border-border p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={piojoLogo} alt="Piojo logo" className="h-14 w-14 rounded-full object-cover shadow-lg" />
              <div>
                <h1 className="font-display text-2xl font-bold text-primary">PIOJO</h1>
                <span className="text-xs font-body text-muted-foreground">2da mano</span>
              </div>
            </Link>
            <h2 className="font-display text-xl font-bold text-foreground">¡Bienvenido de vuelta!</h2>
            <p className="text-muted-foreground text-sm mt-1 font-body">Inicia sesión para seguir reciclando moda 🌿</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground font-body">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@universidad.edu.mx"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body text-sm transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground font-body">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body text-sm transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline font-body font-semibold">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-hero text-primary-foreground font-display font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Iniciar Sesión
              <ArrowRight size={18} />
            </motion.button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground mt-6 font-body">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
