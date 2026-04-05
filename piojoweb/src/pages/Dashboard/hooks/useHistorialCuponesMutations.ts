import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_HISTORIAL_CUPON, UPDATE_HISTORIAL_CUPON, REMOVE_HISTORIAL_CUPON } from '../graphql/historialCuponesMutations';

export function useHistorialCuponesMutations() {
  const [loading, setLoading] = useState(false);

  const createHistorialCupon = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createHistorialCupon: any }>(CREATE_HISTORIAL_CUPON, { input });
      return res.createHistorialCupon;
    } finally { setLoading(false); }
  }, []);

  const updateHistorialCupon = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ updateHistorialCupon: any }>(UPDATE_HISTORIAL_CUPON, { id, input });
      return res.updateHistorialCupon;
    } finally { setLoading(false); }
  }, []);

  const removeHistorialCupon = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removeHistorialCupon: any }>(REMOVE_HISTORIAL_CUPON, { id });
      return res.removeHistorialCupon;
    } finally { setLoading(false); }
  }, []);

  return { loading, createHistorialCupon, updateHistorialCupon, removeHistorialCupon } as const;
}

export default useHistorialCuponesMutations;
