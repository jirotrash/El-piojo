import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_HISTORIAL_TRATO, UPDATE_HISTORIAL_TRATO, REMOVE_HISTORIAL_TRATO } from '../graphql/historialTratosMutations';

export function useHistorialTratosMutations() {
  const [loading, setLoading] = useState(false);

  const createHistorialTrato = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createHistorialTrato: any }>(CREATE_HISTORIAL_TRATO, { input });
      return res.createHistorialTrato;
    } finally { setLoading(false); }
  }, []);

  const updateHistorialTrato = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ updateHistorialTrato: any }>(UPDATE_HISTORIAL_TRATO, { id, input });
      return res.updateHistorialTrato;
    } finally { setLoading(false); }
  }, []);

  const removeHistorialTrato = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removeHistorialTrato: any }>(REMOVE_HISTORIAL_TRATO, { id });
      return res.removeHistorialTrato;
    } finally { setLoading(false); }
  }, []);

  return { loading, createHistorialTrato, updateHistorialTrato, removeHistorialTrato } as const;
}

export default useHistorialTratosMutations;
