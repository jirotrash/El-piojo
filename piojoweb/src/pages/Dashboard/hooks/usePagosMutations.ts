import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_PAGO, UPDATE_PAGO, REMOVE_PAGO } from '../graphql/pagosMutations';

export function usePagosMutations() {
  const [loading, setLoading] = useState(false);

  const createPago = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createPago: any }>(CREATE_PAGO, { createPagosInput: input });
      return res.createPago;
    } finally { setLoading(false); }
  }, []);

  const updatePago = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ updatePago: any }>(UPDATE_PAGO, { id, input });
      return res.updatePago;
    } finally { setLoading(false); }
  }, []);

  const removePago = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removePago: any }>(REMOVE_PAGO, { id });
      return res.removePago;
    } finally { setLoading(false); }
  }, []);

  return { loading, createPago, updatePago, removePago } as const;
}

export default usePagosMutations;
