import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { DETALLE_VENTA_QUERY } from '../graphql/detalleVenta';
import type { DetalleVenta } from '../lib/mock-data';

export function useDetalleVentaApi() {
  const [data, setData] = useState<DetalleVenta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ detalleVenta: DetalleVenta[] }>(DETALLE_VENTA_QUERY);
      setData(res.detalleVenta ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch } as const;
}

export default useDetalleVentaApi;
