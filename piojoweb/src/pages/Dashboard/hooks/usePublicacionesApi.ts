import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { PUBLICACIONES_QUERY } from '../graphql/publicaciones';
import type { Publicacion } from '../lib/mock-data';

export function usePublicacionesApi() {
  const [data, setData] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ publicaciones: Publicacion[] }>(PUBLICACIONES_QUERY);
      setData(res.publicaciones ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch } as const;
}

export default usePublicacionesApi;
