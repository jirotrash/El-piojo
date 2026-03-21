import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_MUNICIPIO, UPDATE_MUNICIPIO, REMOVE_MUNICIPIO } from '../graphql/municipiosMutations';

export function useMunicipiosMutations() {
  const [loading, setLoading] = useState(false);

  const createMunicipio = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createMunicipio: any }>(CREATE_MUNICIPIO, { input });
      return res.createMunicipio;
    } finally { setLoading(false); }
  }, []);

  const updateMunicipio = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ updateMunicipio: any }>(UPDATE_MUNICIPIO, { id, input });
      return res.updateMunicipio;
    } finally { setLoading(false); }
  }, []);

  const removeMunicipio = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removeMunicipio: boolean }>(REMOVE_MUNICIPIO, { id });
      return res.removeMunicipio;
    } finally { setLoading(false); }
  }, []);

  return { loading, createMunicipio, updateMunicipio, removeMunicipio } as const;
}

export default useMunicipiosMutations;
