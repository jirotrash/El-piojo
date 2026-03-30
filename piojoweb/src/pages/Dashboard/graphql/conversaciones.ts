export const CONVERSACIONES_QUERY = `
  query Conversaciones {
    conversaciones {
      id_conversaciones
      fecha_creacion
      publicacion { id_publicaciones titulo }
      vendedor { id_usuarios nombre foto_perfil }
      comprador { id_usuarios nombre foto_perfil }
    }
  }
`;
