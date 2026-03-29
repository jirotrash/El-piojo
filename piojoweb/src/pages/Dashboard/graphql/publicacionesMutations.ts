export const CREATE_PUBLICACION = `
  mutation CreatePublicacion($input: CreatePublicacionesInput!) {
    createPublicacion(input: $input) {
      id_publicaciones
      titulo
    }
  }
`;

export const UPDATE_PUBLICACION = `
  mutation UpdatePublicacion($id: Int!, $input: UpdatePublicacionesInput!) {
    updatePublicacion(id: $id, input: $input) {
      id_publicaciones
      titulo
    }
  }
`;

export const REMOVE_PUBLICACION = `
  mutation RemovePublicacion($id: Int!) {
    removePublicacion(id: $id)
  }
`;
