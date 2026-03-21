import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { HISTORIAL_CUPONES_QUERY } from '../graphql/historialCupones';
import type { HistorialCupon } from '../lib/mock-data';

export function useHistorialCuponesApi() {
  const [data, setData] = useState<HistorialCupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ historialCupones: HistorialCupon[] }>(HISTORIAL_CUPONES_QUERY);
      setData(res.historialCupones ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch } as const;
}

export default useHistorialCuponesApi;
