import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import gql from "@/api/gqlClient";
import { USUARIOS_QUERY } from "@/pages/Dashboard/graphql/usuarios";

type User = any;

type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  ready: boolean;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: async () => false,
  logout: () => {},
  ready: false,
});

const STORAGE_KEY = "piojo-token";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const fetchUserFromToken = async (tkn?: string | null) => {
    const t = tkn ?? token ?? localStorage.getItem(STORAGE_KEY);
    if (!t) { setUser(null); return; }
    let tokenEmail: string | null = null;
    let tokenSub: string | null = null;
    try {
      if ((t.match(/\./g) || []).length === 2) {
        const parts = t.split('.');
        const payload = parts[1];
        const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
        const json = atob(b64 + pad);
        const obj = JSON.parse(json);
        tokenEmail = obj.email || null;
        tokenSub = obj.sub ? String(obj.sub) : null;
      } else {
        const decoded = atob(t);
        const p = decoded.split(":");
        if (p && p[0] && p[0].includes("@")) tokenEmail = p[0];
      }
    } catch (e) {
      tokenEmail = null; tokenSub = null;
    }
    try {
      console.debug('AuthProvider.fetchUserFromToken decoding', { tokenPreview: String(t).slice(0, 20), tokenEmail, tokenSub });
      const usersResp = await gql<{ usuarios: any[] }>(USUARIOS_QUERY, { page: 1, limit: 10000 });
      const users = (usersResp as any)?.usuarios ?? [];
      let found = null;
      if (tokenSub) found = users.find((u: any) => String(u.id_usuarios ?? u.id) === String(tokenSub));
      if (!found && tokenEmail) found = users.find((u: any) => (u?.email || '').toLowerCase() === tokenEmail?.toLowerCase());
      console.debug('AuthProvider.fetchUserFromToken found', { foundId: found?.id_usuarios ?? found?.id, foundEmail: found?.email });
      setUser(found ?? null);
    } catch (e) {
      console.debug('AuthProvider.fetchUserFromToken error', e);
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      const t = localStorage.getItem(STORAGE_KEY);
      if (t) {
        setToken(t);
        await fetchUserFromToken(t);
      }
      setReady(true);
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const loginUrl = (import.meta as any).env?.VITE_API_LOGIN_URL || "";
    const allowMock = (import.meta as any).env?.VITE_AUTH_ALLOW_MOCK === "true";

    const normalizedEmail = String(username ?? "").trim().toLowerCase();

    // Special-case demo admin user: only allow when mock mode is explicitly enabled
    if (allowMock && normalizedEmail === "admincw@gmail.com" && password === "cwpiojo") {
      const mock = btoa(`${normalizedEmail}:${Date.now()}`);
      localStorage.setItem(STORAGE_KEY, mock);
      setToken(mock);
      await fetchUserFromToken(mock);
      return true;
    }

    // REST login endpoint (if configured)
    if (loginUrl) {
      try {
        const res = await fetch(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: normalizedEmail, password }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.token) {
            localStorage.setItem(STORAGE_KEY, data.token);
            setToken(data.token);
            await fetchUserFromToken(data.token);
            return true;
          }
        }
      } catch (e) {
        console.warn("AuthProvider.login: request failed", e);
      }
    }

    // Try GraphQL login mutation
    try {
      const LOGIN_MUTATION = `mutation login($email: String!, $password: String!) { login(email: $email, password: $password) }`;
      const gqlRes = await gql<{ login: string }>(LOGIN_MUTATION, { email: normalizedEmail, password });
      const tokenResp = (gqlRes as any)?.login;
      if (tokenResp) {
        localStorage.setItem(STORAGE_KEY, tokenResp);
        setToken(tokenResp);
        await fetchUserFromToken(tokenResp);
        return true;
      }
    } catch (e: any) {
      // GraphQL login may not be available or credentials invalid; log for debugging
      console.warn('AuthProvider.login: graphql error', e?.message ?? e);
    }

    if (!allowMock) return false;

    // Dev fallback: accept if email exists in usuarios (no password check)
    try {
      const usersResp = await gql<{ usuarios: any[] }>(USUARIOS_QUERY, { page: 1, limit: 10000 });
      const users = (usersResp as any)?.usuarios ?? [];
      const found = users.find((u: any) => (u?.email || '').toLowerCase() === normalizedEmail);
      if (found) {
        console.warn("AuthProvider.login: dev-fallback accepted existing user by email (no password check)");
        const mock = btoa(`${normalizedEmail}:${Date.now()}`);
        localStorage.setItem(STORAGE_KEY, mock);
        setToken(mock);
        await fetchUserFromToken(mock);
        return true;
      }
    } catch (e) {
      // ignore
    }

    // Final fallback mock token
    console.warn("AuthProvider.login: using mock token as fallback");
    const mock = btoa(`${normalizedEmail}:${Date.now()}`);
    localStorage.setItem(STORAGE_KEY, mock);
    setToken(mock);
    await fetchUserFromToken(mock);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ token, user, login, logout, ready }}>{children}</AuthContext.Provider>;
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
