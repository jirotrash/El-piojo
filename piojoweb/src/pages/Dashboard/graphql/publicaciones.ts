export const PUBLICACIONES_QUERY = `
  query Publicaciones {
    publicaciones {
      id_publicaciones
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
    }
  }
`;
