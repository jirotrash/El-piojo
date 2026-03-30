export const DETALLE_MENSAJES_QUERY = `
  query DetalleMensajes {
    detalleMensajes {
      id_detalle_mensajes
      mensaje
      fecha_envio
      conversacion { id_conversaciones }
      emisor { id_usuarios nombre foto_perfil }
    }
  }
`;
