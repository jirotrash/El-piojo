import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_DETALLE_PUBLICACION, UPDATE_DETALLE_PUBLICACION, REMOVE_DETALLE_PUBLICACION } from '../graphql/detallePublicacionesMutations';

export function useDetallePublicacionesMutations() {
  const [loading, setLoading] = useState(false);

  const createDetalle = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createDetallePublicacion: any }>(CREATE_DETALLE_PUBLICACION, { input });
      return res.createDetallePublicacion;
    } finally { setLoading(false); }
  }, []);

  const updateDetalle = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ updateDetallePublicacion: any }>(UPDATE_DETALLE_PUBLICACION, { id, input });
      return res.updateDetallePublicacion;
    } finally { setLoading(false); }
  }, []);

  const removeDetalle = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removeDetallePublicacion: boolean }>(REMOVE_DETALLE_PUBLICACION, { id });
      return res.removeDetallePublicacion;
    } finally { setLoading(false); }
  }, []);

  return { loading, createDetalle, updateDetalle, removeDetalle } as const;
}

export default useDetallePublicacionesMutations;
