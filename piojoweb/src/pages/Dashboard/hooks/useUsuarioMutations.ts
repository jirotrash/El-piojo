import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_USUARIO, UPDATE_USUARIO, REMOVE_USUARIO } from '../graphql/usuariosMutations';

export function useUsuarioMutations() {
  const [loading, setLoading] = useState(false);

  const createUsuario = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const variables = {
        input: {
          nombre: input.nombre,
          apellido_paterno: input.apellido_paterno,
          apellido_materno: input.apellido_materno ?? null,
          email: input.email,
          password: input.password,
          telefono: input.telefono ?? null,
          matricula: input.matricula ?? null,
          direccion: input.direccion ?? null,
          foto_perfil: input.foto_perfil ?? null,
          id_roles: input.id_roles != null ? Number(input.id_roles) : null,
          id_carreras: input.id_carreras != null ? Number(input.id_carreras) : null,
          id_municipios: input.id_municipios != null ? Number(input.id_municipios) : null,
        }
      };

      const res = await gql<{ createUsuario: any }>(CREATE_USUARIO, variables);
      return res.createUsuario;
    } finally { setLoading(false); }
  }, []);

  const updateUsuario = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      // Sanitize input: convert numeric id fields from select (strings) to numbers,
      // and remove any read-only fields such as fecha_registro that the server
      // does not expect in the input object.
      const sanitized: Record<string, any> = { ...input };
      if (sanitized.id_roles != null) sanitized.id_roles = Number(sanitized.id_roles);
      if (sanitized.id_carreras != null) sanitized.id_carreras = Number(sanitized.id_carreras);
      if (sanitized.id_municipios != null) sanitized.id_municipios = Number(sanitized.id_municipios);
      // Remove fecha_registro if present (server manages timestamps)
      if ('fecha_registro' in sanitized) delete sanitized.fecha_registro;
      // Remove id_usuarios if present — GraphQL input does not accept it
      if ('id_usuarios' in sanitized) delete sanitized.id_usuarios;
      // Remove generic `id` added by the UI mapping
      if ('id' in sanitized) delete sanitized.id;

      const res = await gql<{ updateUsuario: any }>(UPDATE_USUARIO, { id, input: sanitized });
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
