import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { DETALLE_MENSAJES_QUERY } from '../graphql/detalleMensajes';
import type { DetalleMensaje } from '../lib/mock-data';

export function useDetalleMensajesApi() {
  const [data, setData] = useState<DetalleMensaje[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ detalleMensajes: DetalleMensaje[] }>(DETALLE_MENSAJES_QUERY);
      setData(res.detalleMensajes ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch } as const;
}

export default useDetalleMensajesApi;
