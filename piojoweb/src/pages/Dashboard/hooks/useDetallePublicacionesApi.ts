import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { DETALLE_PUBLICACIONES_QUERY } from '../graphql/detallePublicaciones';
import type { DetallePublicacion } from '../lib/mock-data';

export function useDetallePublicacionesApi() {
  const [data, setData] = useState<DetallePublicacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ detallePublicaciones: DetallePublicacion[] }>(DETALLE_PUBLICACIONES_QUERY);
      setData(res.detallePublicaciones ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch } as const;
}

export default useDetallePublicacionesApi;
