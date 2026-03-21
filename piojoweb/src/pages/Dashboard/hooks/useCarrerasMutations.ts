import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_CARRERA, UPDATE_CARRERA, REMOVE_CARRERA } from '../graphql/carrerasMutations';

export function useCarrerasMutations() {
  const [loading, setLoading] = useState(false);

  const createCarrera = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createCarrera: any }>(CREATE_CARRERA, { input });
      return res.createCarrera;
    } finally { setLoading(false); }
  }, []);

  const updateCarrera = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ updateCarrera: any }>(UPDATE_CARRERA, { id, input });
      return res.updateCarrera;
    } finally { setLoading(false); }
  }, []);

  const removeCarrera = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removeCarrera: boolean }>(REMOVE_CARRERA, { id });
      return res.removeCarrera;
    } finally { setLoading(false); }
  }, []);

  return { loading, createCarrera, updateCarrera, removeCarrera } as const;
}

export default useCarrerasMutations;
