import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { CARRERAS_QUERY } from '../graphql/carreras';
import type { Carrera } from '../lib/mock-data';

export function useCarrerasApi() {
  const [data, setData] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ carreras: Carrera[] }>(CARRERAS_QUERY);
      setData(res.carreras ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch } as const;
}

export default useCarrerasApi;
