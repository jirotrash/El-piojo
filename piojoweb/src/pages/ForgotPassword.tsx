import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import piojoLogo from "@/assets/piojo-logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí conectarás tu backend
    console.log({ email });
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-fun opacity-10 blur-3xl" />

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
        <div className="bg-card rounded-3xl shadow-card border border-border p-8">
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={piojoLogo} alt="Piojo logo" className="h-12 w-12 rounded-full object-cover shadow-lg" />
              <h1 className="font-display text-2xl font-bold text-primary">PIOJO</h1>
            </Link>
            <h2 className="font-display text-xl font-bold text-foreground">Recuperar contraseña</h2>
            <p className="text-muted-foreground text-sm mt-1 font-body text-center">
              Te enviaremos un enlace para restablecer tu contraseña 📧
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
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

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-hero text-primary-foreground font-display font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                Enviar enlace
                <Send size={16} />
              </motion.button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Send size={28} className="text-primary" />
              </div>
              <p className="font-body text-foreground font-semibold">¡Correo enviado!</p>
              <p className="text-sm text-muted-foreground font-body">
                Revisa tu bandeja de entrada en <strong className="text-foreground">{email}</strong>
              </p>
            </motion.div>
          )}

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 mt-6 text-sm text-primary font-body font-semibold hover:underline"
          >
            <ArrowLeft size={16} />
            Volver al login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
