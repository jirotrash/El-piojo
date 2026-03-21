import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { PAGOS_QUERY } from '../graphql/pagos';
import type { Pago } from '../lib/mock-data';

export function usePagosApi() {
  const [data, setData] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ pagos: Pago[] }>(PAGOS_QUERY);
      setData(res.pagos ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch } as const;
}

export default usePagosApi;
