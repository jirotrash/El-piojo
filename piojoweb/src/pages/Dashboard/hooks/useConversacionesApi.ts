import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { CONVERSACIONES_QUERY } from '../graphql/conversaciones';
import type { Conversacion } from '../lib/mock-data';

export function useConversacionesApi() {
  const [data, setData] = useState<Conversacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ conversaciones: Conversacion[] }>(CONVERSACIONES_QUERY);
      setData(res.conversaciones ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch } as const;
}

export default useConversacionesApi;
