export const CREATE_DETALLE_MENSAJE = `
  mutation CreateDetalleMensaje($input: CreateDetalleMensajesInput!) {
    createDetalleMensaje(createDetalleMensajesInput: $input) {
      id_detalle_mensajes
      id_conversaciones
      id_emisor
      mensaje
      fecha_envio
    }
  }
`;

export const UPDATE_DETALLE_MENSAJE = `
  mutation UpdateDetalleMensaje($id: Int!, $input: UpdateDetalleMensajesInput!) {
    updateDetalleMensaje(id: $id, updateDetalleMensajesInput: $input) {
      id_detalle_mensajes
      id_conversaciones
      id_emisor
      mensaje
      fecha_envio
    }
  }
`;

export const REMOVE_DETALLE_MENSAJE = `
  mutation RemoveDetalleMensaje($id: Int!) {
    removeDetalleMensaje(id: $id)
  }
`;

export default { CREATE_DETALLE_MENSAJE, UPDATE_DETALLE_MENSAJE, REMOVE_DETALLE_MENSAJE };
