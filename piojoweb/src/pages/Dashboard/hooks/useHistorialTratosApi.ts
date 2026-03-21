import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { HISTORIAL_TRATOS_QUERY } from '../graphql/historialTratos';
import type { HistorialTrato } from '../lib/mock-data';

export function useHistorialTratosApi() {
  const [data, setData] = useState<HistorialTrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ historialTratos: HistorialTrato[] }>(HISTORIAL_TRATOS_QUERY);
      setData(res.historialTratos ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch } as const;
}

export default useHistorialTratosApi;
