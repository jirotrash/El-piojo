import { useCallback, useEffect, useState } from 'react';
import gql from '../../../api/gqlClient';
import { USUARIOS_QUERY } from '../graphql/usuarios';

export function useUsuarioInfinite(limit = 10) {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(async (p: number) => {
    const res = await gql<{ usuarios: any[] }>(USUARIOS_QUERY, { page: p, limit });
    const usuarios = res.usuarios ?? [];
    const mapped = usuarios.map((u: any) => ({ ...u, id: u.id_usuarios ?? u.id ?? u._id }));
    return mapped;
  }, [limit]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const mapped = await fetchPage(1);
      setData(mapped);
      setPage(1);
      setHasMore(mapped.length === limit);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [fetchPage, limit]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const mapped = await fetchPage(next);
      setData((d) => [...d, ...mapped]);
      setPage(next);
      setHasMore(mapped.length === limit);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, page, limit, loadingMore, loading, hasMore]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, loadingMore, error, hasMore, loadMore, refresh } as const;
}

export default useUsuarioInfinite;
