import axios from 'axios';
import { Platform } from 'react-native';


export const API_URL =
  Platform.OS === 'android'
    ? 'https://api-elpiojo.utvt.cloud/graphql'
    : 'https://api-elpiojo.utvt.cloud/graphql';

export const UPLOAD_URL = API_URL.replace('/graphql', '/upload');

// Sube una imagen al servidor por su URI local y devuelve la URL pública
export async function uploadImage(fileUri: string): Promise<string | null> {
  try {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() ?? 'photo.jpg';
    const match = /\.([a-zA-Z]+)$/.exec(filename);
    const type = match ? `image/${match[1].toLowerCase().replace('jpg', 'jpeg')}` : 'image/jpeg';
    formData.append('file', { uri: fileUri, name: filename, type } as any);
    const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.url as string) ?? null;
  } catch {
    return null;
  }
}

// ── Token en memoria (persiste mientras la app está abierta) ─────────────────
let _token: string | null = null;
export const setAuthToken = (token: string | null) => { _token = token; };
export const getAuthToken = () => _token;

// ── Decode JWT payload sin librerías externas ─────────────────────────────────
export function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''),
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

// ── Cliente axios ──────────────────────────────────────────────────────────────
export const pandoraApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Inyecta el JWT en cada request si existe
pandoraApi.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`;
  return config;
});

// ── Helper genérico para queries/mutations ────────────────────────────────────
export const graphqlRequest = async <T>(
  query: string,
  variables?: object,
): Promise<T> => {
  try {
    const response = await pandoraApi.post('', { query, variables });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data as T;
  } catch (error: any) {
    throw error;
  }
};