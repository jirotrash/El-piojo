import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { USUARIOS_QUERY } from '../graphql/usuarios';
import type { Usuario } from '../interfaces/usuario.interface';


export function useUsuarioApi(page = 1, limit = 10) {
  const [data, setData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ usuarios: any[] }>(USUARIOS_QUERY, { page, limit });
      const usuarios = res.usuarios ?? [];
      // Normalize backend field `id_usuarios` to `id` expected by the UI
      const mapped = usuarios.map((u) => ({ ...u, id: u.id_usuarios ?? u.id ?? u._id }));
      setData(mapped);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetch();
  }, [fetch, page, limit]);

  return { data, loading, error, refetch: fetch } as const;
}

export default useUsuarioApi;
