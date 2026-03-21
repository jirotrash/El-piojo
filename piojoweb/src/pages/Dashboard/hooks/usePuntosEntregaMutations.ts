import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_PUNTO_ENTREGA, UPDATE_PUNTO_ENTREGA, REMOVE_PUNTO_ENTREGA } from '../graphql/puntosEntregaMutations';

export function usePuntosEntregaMutations() {
  const [loading, setLoading] = useState(false);

  const createPuntoEntrega = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const vars = {
        input: {
          nombre: input.nombre ?? "",
          id_municipios: Number(input.id_municipios ?? 0),
          latitud: Number(input.latitud ?? 0),
          longitud: Number(input.longitud ?? 0),
          descripcion: input.descripcion ?? null,
        },
      };
      const res = await gql<{ createPuntoEntrega: any }>(CREATE_PUNTO_ENTREGA, vars);
      return res.createPuntoEntrega;
    } finally { setLoading(false); }
  }, []);

  const updatePuntoEntrega = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const vars = {
        id,
        input: {
          nombre: input.nombre ?? null,
          id_municipios: input.id_municipios != null ? Number(input.id_municipios) : null,
          latitud: input.latitud != null ? Number(input.latitud) : null,
          longitud: input.longitud != null ? Number(input.longitud) : null,
          descripcion: input.descripcion ?? null,
        },
      };
      const res = await gql<{ updatePuntoEntrega: any }>(UPDATE_PUNTO_ENTREGA, vars);
      return res.updatePuntoEntrega;
    } finally { setLoading(false); }
  }, []);

  const removePuntoEntrega = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removePuntoEntrega: boolean }>(REMOVE_PUNTO_ENTREGA, { id });
      return res.removePuntoEntrega;
    } finally { setLoading(false); }
  }, []);

  return { loading, createPuntoEntrega, updatePuntoEntrega, removePuntoEntrega } as const;
}

export default usePuntosEntregaMutations;
