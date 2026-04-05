import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_DETALLE_MENSAJE, UPDATE_DETALLE_MENSAJE, REMOVE_DETALLE_MENSAJE } from '../graphql/detalleMensajesMutations';

export function useDetalleMensajesMutations() {
  const [loading, setLoading] = useState(false);

  const createDetalleMensaje = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createDetalleMensaje: any }>(CREATE_DETALLE_MENSAJE, { input });
      return res.createDetalleMensaje;
    } finally { setLoading(false); }
  }, []);

  const updateDetalleMensaje = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ updateDetalleMensaje: any }>(UPDATE_DETALLE_MENSAJE, { id, input });
      return res.updateDetalleMensaje;
    } finally { setLoading(false); }
  }, []);

  const removeDetalleMensaje = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removeDetalleMensaje: any }>(REMOVE_DETALLE_MENSAJE, { id });
      return res.removeDetalleMensaje;
    } finally { setLoading(false); }
  }, []);

  return { loading, createDetalleMensaje, updateDetalleMensaje, removeDetalleMensaje } as const;
}

export default useDetalleMensajesMutations;
