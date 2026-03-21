import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { PUNTOS_ENTREGA_QUERY } from '../graphql/puntosEntrega';
import type { PuntoEntrega } from '../lib/mock-data';

export function usePuntosEntregaApi() {
  const [data, setData] = useState<PuntoEntrega[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ puntosEntrega: PuntoEntrega[] }>(PUNTOS_ENTREGA_QUERY);
      setData(res.puntosEntrega ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch } as const;
}

export default usePuntosEntregaApi;
