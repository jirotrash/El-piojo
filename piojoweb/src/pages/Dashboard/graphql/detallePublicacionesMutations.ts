export const CREATE_DETALLE_PUBLICACION = `
  mutation CreateDetallePublicacion($input: CreateDetallePublicacionesInput!) {
    createDetallePublicacion(input: $input) {
      id_detalle_publicaciones
      url_foto
      es_portada
      id_publicaciones
    }
  }
`;

export const UPDATE_DETALLE_PUBLICACION = `
  mutation UpdateDetallePublicacion($id: Int!, $input: UpdateDetallePublicacionesInput!) {
    updateDetallePublicacion(id: $id, input: $input) {
      id_detalle_publicaciones
      url_foto
      es_portada
      id_publicaciones
    }
  }
`;

export const REMOVE_DETALLE_PUBLICACION = `
  mutation RemoveDetallePublicacion($id: Int!) {
    removeDetallePublicacion(id: $id)
  }
`;
