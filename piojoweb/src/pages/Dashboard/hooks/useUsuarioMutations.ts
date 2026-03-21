import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_USUARIO, UPDATE_USUARIO, REMOVE_USUARIO } from '../graphql/usuariosMutations';

export function useUsuarioMutations() {
  const [loading, setLoading] = useState(false);

  const createUsuario = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createUsuario: any }>(CREATE_USUARIO, { input });
      return res.createUsuario;
    } finally { setLoading(false); }
  }, []);

  const updateUsuario = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ updateUsuario: any }>(UPDATE_USUARIO, { id, input });
      return res.updateUsuario;
    } finally { setLoading(false); }
  }, []);

  const removeUsuario = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removeUsuario: boolean }>(REMOVE_USUARIO, { id });
      return res.removeUsuario;
    } finally { setLoading(false); }
  }, []);

  return { loading, createUsuario, updateUsuario, removeUsuario } as const;
}

export default useUsuarioMutations;
