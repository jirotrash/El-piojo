import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_ESTADO, UPDATE_ESTADO, REMOVE_ESTADO } from '../graphql/estadosMutations';

export function useEstadosMutations() {
  const [loading, setLoading] = useState(false);

  const createEstado = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createEstado: any }>(CREATE_ESTADO, { input });
      return res.createEstado;
    } finally { setLoading(false); }
  }, []);

  const updateEstado = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ updateEstado: any }>(UPDATE_ESTADO, { id, input });
      return res.updateEstado;
    } finally { setLoading(false); }
  }, []);

  const removeEstado = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removeEstado: boolean }>(REMOVE_ESTADO, { id });
      return res.removeEstado;
    } finally { setLoading(false); }
  }, []);

  return { loading, createEstado, updateEstado, removeEstado } as const;
}

export default useEstadosMutations;
