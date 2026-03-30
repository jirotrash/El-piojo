import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_CONVERSACION, CREATE_DETALLE_MENSAJE } from '../graphql/mensajesMutations';

export function useMensajesMutations() {
  const [loading, setLoading] = useState(false);

  const createConversacion = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createConversacion: any }>(CREATE_CONVERSACION, { input });
      return res.createConversacion;
    } finally { setLoading(false); }
  }, []);

  const createDetalleMensaje = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createDetalleMensaje: any }>(CREATE_DETALLE_MENSAJE, { input });
      return res.createDetalleMensaje;
    } finally { setLoading(false); }
  }, []);

  return { loading, createConversacion, createDetalleMensaje } as const;
}

export default useMensajesMutations;
