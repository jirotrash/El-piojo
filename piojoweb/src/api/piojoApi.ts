import axios from 'axios';

// Use Vite dev-server proxy by default: a relative '/graphql' path will be
// proxied to the backend to avoid CORS/preflight issues during development.
// You can override with `VITE_GRAPHQL_URL` if you need a different target.
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL ?? '/graphql';

export const piojoApi = axios.create({
    baseURL: GRAPHQL_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach Authorization header from localStorage token (if present)
piojoApi.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem('piojo-token');
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    } catch (e) {
        // ignore
    }
    return config;
});