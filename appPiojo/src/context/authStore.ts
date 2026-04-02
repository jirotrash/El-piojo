import { create } from 'zustand';
import { User } from '../interfaces';
import { graphqlRequest, setAuthToken, decodeJwtPayload } from '../api/api';
import { LOGIN_MUTATION, REGISTER_MUTATION, GET_USUARIO_QUERY } from '../api/queries';

export interface RegisterData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  email: string;
  password: string;
  telefono?: string;
  matricula?: string;
  direccion?: string;
  id_roles: number;
  id_carreras?: number;
  id_municipios?: number;
  foto_perfil?: string;
}

// Mapea el objeto UsuariosType del backend al User del frontend
function mapBackendUser(u: any): User {
  return {
    id: String(u.id_usuarios),
    email: u.email,
    name: [u.nombre, u.apellido_paterno, u.apellido_materno].filter(Boolean).join(' '),
    role: u.id_roles === 2 ? 'admin' : 'vendedor',
    matricula: u.matricula ?? undefined,
    foto_perfil: u.foto_perfil ?? undefined,
  };
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Obtener JWT
      const loginData = await graphqlRequest<{ login: string }>(
        LOGIN_MUTATION, { email, password },
      );
      const token = loginData.login;
      setAuthToken(token);

      // 2. Decodificar id del token y obtener datos del usuario
      const payload = decodeJwtPayload(token);
      const userId: number = payload.sub;
      const userData = await graphqlRequest<{ usuario: any }>(
        GET_USUARIO_QUERY, { id: userId },
      );

      set({
        user: mapBackendUser(userData.usuario),
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const msg = err?.message ?? 'Error al iniciar sesión';
      set({ error: msg === 'Credenciales inválidas' ? 'Email o contraseña incorrectos' : msg, isLoading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // Construir input limpio (sin undefined)
      const input: Record<string, any> = {
        nombre: data.nombre,
        apellido_paterno: data.apellido_paterno,
        email: data.email,
        password: data.password,
        id_municipios: data.id_municipios ?? 1,
        id_roles: data.id_roles,
      };
      if (data.apellido_materno) input.apellido_materno = data.apellido_materno;
      if (data.telefono)         input.telefono        = data.telefono;
      if (data.matricula)        input.matricula       = data.matricula;
      if (data.direccion)        input.direccion       = data.direccion;
      if (data.id_carreras)      input.id_carreras     = data.id_carreras;
      if (data.foto_perfil)      input.foto_perfil     = data.foto_perfil;

      await graphqlRequest(REGISTER_MUTATION, { input });

      // Auto-login tras el registro
      set({ isLoading: false });
      return get().login(data.email, data.password);
    } catch (err: any) {
      const raw = err?.message ?? '';
      const msg = raw.toLowerCase().includes('duplicate') || raw.toLowerCase().includes('exist')
        ? 'Este email ya está registrado'
        : raw || 'Error al registrar';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    setAuthToken(null);
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
