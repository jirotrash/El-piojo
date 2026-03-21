import { useEffect, useState, useCallback } from 'react';
import { gql } from '../api/gqlClient';

type Usuario = any;

export function useUsuarios() {
  const [data, setData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = `
        query {
          usuarios {
            id
            nombre
            email
          }
        }
      `;
      const res = await gql<{ usuarios: Usuario[] }>(query);
      setData(res.usuarios ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return { data, loading, error, refetch: fetchUsuarios };
}

export default useUsuarios;
