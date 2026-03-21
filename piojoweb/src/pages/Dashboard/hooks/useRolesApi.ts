import { useEffect, useState, useCallback } from 'react';
import gql from '../../../api/gqlClient';
import { ROLES_QUERY } from '../graphql/roles';
import type { Rol } from '../lib/mock-data';

export function useRolesApi() {
  const [data, setData] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gql<{ roles: Rol[] }>(ROLES_QUERY);
      setData(res.roles ?? []);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch } as const;
}

export default useRolesApi;
