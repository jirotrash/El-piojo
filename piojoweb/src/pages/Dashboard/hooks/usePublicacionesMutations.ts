import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_PUBLICACION, UPDATE_PUBLICACION, REMOVE_PUBLICACION } from '../graphql/publicacionesMutations';

export function usePublicacionesMutations() {
  const [loading, setLoading] = useState(false);

  const sanitize = (input: Record<string, any>) => {
    const out: Record<string, any> = { ...input };
    delete out.id_publicaciones;
    if ('id_puntos_entrega' in out) out.id_puntos_entrega = out.id_puntos_entrega === '' || out.id_puntos_entrega === null || out.id_puntos_entrega === undefined ? undefined : Number(out.id_puntos_entrega);
    if ('id_usuarios' in out) out.id_usuarios = out.id_usuarios === '' || out.id_usuarios === null || out.id_usuarios === undefined ? undefined : Number(out.id_usuarios);
    if ('precio' in out) out.precio = out.precio === '' || out.precio === null || out.precio === undefined ? undefined : Number(out.precio);
    if ('disponible' in out) out.disponible = Boolean(out.disponible);
    // Map some string fields to backend enum values (backend expects UPPERCASE enum names)
    const toEnumValue = (val: any) => {
      if (val === null || val === undefined) return val;
      const s = String(val).trim();
      if (s === '') return undefined;
      const map: Record<string, string> = {
        Hombre: 'HOMBRE', hombre: 'HOMBRE', HOMBRE: 'HOMBRE',
        Mujer: 'MUJER', mujer: 'MUJER', MUJER: 'MUJER',
        Unisex: 'UNISEX', unisex: 'UNISEX', UNISEX: 'UNISEX',
        Nuevo: 'NUEVO', nuevo: 'NUEVO', NUEVO: 'NUEVO',
        Seminuevo: 'SEMINUEVO', seminuevo: 'SEMINUEVO', SEMINUEVO: 'SEMINUEVO',
        Usado: 'USADO', usado: 'USADO', USADO: 'USADO',
      };
      if (map[s]) return map[s];
      return s.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    };

    if ('genero' in out) out.genero = toEnumValue(out.genero);
    if ('estado_uso' in out) out.estado_uso = toEnumValue(out.estado_uso);

    if ('fecha_publicacion' in out) {
      const v = out.fecha_publicacion;
      if (typeof v === 'string') {
        // handle datetime-local like '2026-03-28T14:05'
        const parsed = Date.parse(v);
        if (!isNaN(parsed)) out.fecha_publicacion = parsed;
      } else if (typeof v === 'number') {
        // if seconds, convert to ms
        out.fecha_publicacion = v < 1e12 ? v * 1000 : v;
      }
    }
    return out;
  };

  const createPublicacion = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const payload = sanitize(input);
      // The server's CreatePublicacionesInput does not accept `fecha_publicacion`.
      // Remove it from the create payload to avoid GraphQL validation errors.
      if ('fecha_publicacion' in payload) delete payload.fecha_publicacion;
      const res = await gql<{ createPublicacion: any }>(CREATE_PUBLICACION, { input: payload });
      return res.createPublicacion;
    } finally { setLoading(false); }
  }, []);

  const updatePublicacion = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const payload = sanitize(input);
      const res = await gql<{ updatePublicacion: any }>(UPDATE_PUBLICACION, { id, input: payload });
      return res.updatePublicacion;
    } finally { setLoading(false); }
  }, []);

  const removePublicacion = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removePublicacion: boolean }>(REMOVE_PUBLICACION, { id });
      return res.removePublicacion;
    } finally { setLoading(false); }
  }, []);

  return { loading, createPublicacion, updatePublicacion, removePublicacion } as const;
}

export default usePublicacionesMutations;
