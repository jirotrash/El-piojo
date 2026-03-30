export const CREATE_CONVERSACION = `
  mutation CreateConversacion($input: CreateConversacionesInput!) {
    createConversacion(createConversacionesInput: $input) {
      id_conversaciones
      fecha_creacion
    }
  }
`;

export const CREATE_DETALLE_MENSAJE = `
  mutation CreateDetalleMensaje($input: CreateDetalleMensajesInput!) {
    createDetalleMensaje(createDetalleMensajesInput: $input) {
      id_detalle_mensajes
      mensaje
      fecha_envio
    }
  }
`;
