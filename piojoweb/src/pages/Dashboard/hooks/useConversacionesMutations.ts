import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_CONVERSACION, UPDATE_CONVERSACION, REMOVE_CONVERSACION } from '../graphql/conversacionesMutations';

export function useConversacionesMutations() {
  const [loading, setLoading] = useState(false);

  const createConversacion = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createConversacion: any }>(CREATE_CONVERSACION, { input });
      return res.createConversacion;
    } finally { setLoading(false); }
  }, []);

  const updateConversacion = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ updateConversacion: any }>(UPDATE_CONVERSACION, { id, input });
      return res.updateConversacion;
    } finally { setLoading(false); }
  }, []);

  const removeConversacion = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removeConversacion: any }>(REMOVE_CONVERSACION, { id });
      return res.removeConversacion;
    } finally { setLoading(false); }
  }, []);

  return { loading, createConversacion, updateConversacion, removeConversacion } as const;
}

export default useConversacionesMutations;
