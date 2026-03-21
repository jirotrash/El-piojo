import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { MUNICIPIOS_QUERY } from '../graphql/municipios';
import type { Municipio } from '../lib/mock-data';

export function useMunicipiosApi() {
  const [data, setData] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ municipios: Municipio[] }>(MUNICIPIOS_QUERY);
      setData(res.municipios ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch } as const;
}

export default useMunicipiosApi;
