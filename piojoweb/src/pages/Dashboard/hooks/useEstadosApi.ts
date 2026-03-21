import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { ESTADOS_QUERY } from '../graphql/estados';
import type { Estado } from '../lib/mock-data';

export function useEstadosApi() {
  const [data, setData] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ estados: Estado[] }>(ESTADOS_QUERY);
      setData(res.estados ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch } as const;
}

export default useEstadosApi;
