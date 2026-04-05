import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_DETALLE_VENTA, UPDATE_DETALLE_VENTA, REMOVE_DETALLE_VENTA } from '../graphql/detalleVentaMutations';

export function useDetalleVentaMutations() {
  const [loading, setLoading] = useState(false);

  const createDetalleVenta = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createDetalleVenta: any }>(CREATE_DETALLE_VENTA, { createDetalleVentaInput: input });
      return res.createDetalleVenta;
    } finally { setLoading(false); }
  }, []);

  const updateDetalleVenta = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ updateDetalleVenta: any }>(UPDATE_DETALLE_VENTA, { id, input });
      return res.updateDetalleVenta;
    } finally { setLoading(false); }
  }, []);

  const removeDetalleVenta = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removeDetalleVenta: any }>(REMOVE_DETALLE_VENTA, { id });
      return res.removeDetalleVenta;
    } finally { setLoading(false); }
  }, []);

  return { loading, createDetalleVenta, updateDetalleVenta, removeDetalleVenta } as const;
}

export default useDetalleVentaMutations;
