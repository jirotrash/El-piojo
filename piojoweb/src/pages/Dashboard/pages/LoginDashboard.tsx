import { FormEvent, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginDashboard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await auth.login(username, password);
    setLoading(false);
    if (ok) navigate(from, { replace: true });
    else setError("Credenciales inválidas");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background image: place your image at public/assets/crow-bg.jpg */}
      <div
        aria-hidden
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: "url('/assets/crow-bg.jpg')",
          filter: "blur(18px) grayscale(10%)",
          transform: "scale(1.05)",
          zIndex: 0,
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-black/60" style={{ zIndex: 1 }} />

      <div style={{ zIndex: 10 }} className="relative w-full max-w-sm">
        <form onSubmit={submit} className="w-full space-y-6 bg-[rgba(10,14,20,0.6)] p-8 rounded-2xl shadow-2xl border border-slate-800">
          <div className="flex flex-col items-center gap-1">
            <div className="h-14 w-14 bg-cyan-500/90 rounded-md flex items-center justify-center shadow">🔒</div>
            <h1 className="text-xl font-bold tracking-wide">CROW INNOVATION</h1>
            <div className="text-xs text-muted-foreground">TECHNOLOGIES</div>
          </div>
          {error && <div className="text-sm text-red-400 text-center">{error}</div>}
          <div>
            <label className="text-xs text-muted-foreground">Correo electrónico</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Contraseña</label>
            <Input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
          </div>
          <div>
            <Button
              type="submit"
              className="w-full bg-cyan-400 hover:bg-cyan-500 text-slate-900 font-semibold"
              disabled={loading}
            >
              {loading ? "Entrando..." : "INICIAR SESIÓN"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
