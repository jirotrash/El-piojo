export const PUBLICACIONES_QUERY = `
  query Publicaciones {
    publicaciones {
      id_publicaciones
      id_usuarios
      id_puntos_entrega
      titulo
      descripcion
      categoria
      talla
      marca
      color
      genero
      estado_uso
      precio
      disponible
      fecha_publicacion
      detallePublicaciones {
        url_foto
        es_portada
      }
    }
  }
`;
