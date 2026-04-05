export const CREATE_CONVERSACION = `
  mutation CreateConversacion($input: CreateConversacionesInput!) {
    createConversacion(createConversacionesInput: $input) {
      id_conversaciones
      id_publicaciones
      id_vendedor
      id_comprador
      fecha_creacion
    }
  }
`;

export const UPDATE_CONVERSACION = `
  mutation UpdateConversacion($id: Int!, $input: UpdateConversacionesInput!) {
    updateConversacion(id: $id, updateConversacionesInput: $input) {
      id_conversaciones
      id_publicaciones
      id_vendedor
      id_comprador
      fecha_creacion
    }
  }
`;

export const REMOVE_CONVERSACION = `
  mutation RemoveConversacion($id: Int!) {
    removeConversacion(id: $id)
  }
`;

export default { CREATE_CONVERSACION, UPDATE_CONVERSACION, REMOVE_CONVERSACION };
