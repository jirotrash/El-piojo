import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";

type AuthContextType = {
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  ready: boolean;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: async () => false,
  logout: () => {},
  ready: false,
});

const STORAGE_KEY = "piojo-token";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem(STORAGE_KEY);
    if (t) setToken(t);
    setReady(true);
  }, []);

  const login = async (username: string, password: string) => {
    const loginUrl = (import.meta as any).env?.VITE_API_LOGIN_URL || "/api/login";
    const allowMock = (import.meta as any).env?.VITE_AUTH_ALLOW_MOCK !== "false";

    // Special-case demo admin user: allow direct login with known demo password
    if (username === "admincw@gmail.com" && password === "cwpiojo") {
      const mock = btoa(`${username}:${Date.now()}`);
      localStorage.setItem(STORAGE_KEY, mock);
      setToken(mock);
      return true;
    }

    try {
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.token) {
          localStorage.setItem(STORAGE_KEY, data.token);
          setToken(data.token);
          return true;
        }
      }
    } catch (e) {
      console.warn("AuthProvider.login: request failed", e);
    }

    if (!allowMock) return false;

    // Fallback: mock token for demo when backend not available
    console.warn("AuthProvider.login: using mock token as fallback");
    const mock = btoa(`${username}:${Date.now()}`);
    localStorage.setItem(STORAGE_KEY, mock);
    setToken(mock);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  };

  return <AuthContext.Provider value={{ token, login, logout, ready }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export const RequireAuth = ({ children, redirectTo = "/login" }: { children: JSX.Element; redirectTo?: string }) => {
  const { token, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;
  if (!token) return <Navigate to={redirectTo} replace state={{ from: location }} />;
  return children;
};

export function useRequireAuthNavigate() {
  const navigate = useNavigate();
  const { token } = useAuth();
  return { navigate, isAuthenticated: !!token };
}

export default AuthProvider;
