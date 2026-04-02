// ── Autenticación ─────────────────────────────────────────────────────────────

export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export const REGISTER_MUTATION = `
  mutation CreateUsuario($input: CreateUsuariosInput!) {
    createUsuario(input: $input) {
      id_usuarios
      nombre
      apellido_paterno
      apellido_materno
      email
      telefono
      matricula
      foto_perfil
      id_roles
    }
  }
`;

export const GET_USUARIO_QUERY = `
  query Usuario($id: Int!) {
    usuario(id: $id) {
      id_usuarios
      nombre
      apellido_paterno
      apellido_materno
      email
      telefono
      matricula
      foto_perfil
      id_roles
    }
  }
`;

// ── Formulario de Registro ────────────────────────────────────────────────────

export const GET_CARRERAS_QUERY = `
  query {
    carreras {
      id_carreras
      nombre
    }
  }
`;

export const GET_MUNICIPIOS_QUERY = `
  query {
    municipios {
      id_municipios
      nombre
    }
  }
`;

export const GET_PUNTOS_ENTREGA_QUERY = `
  query {
    puntosEntrega {
      id_puntos_entrega
      nombre
      descripcion
    }
  }
`;

// ── Chat ─────────────────────────────────────────────────────────────────────

export const GET_CONVERSACIONES_QUERY = `
  query {
    conversaciones {
      id_conversaciones
      fecha_creacion
      publicacion {
        id_publicaciones
        titulo
        precio
        disponible
      }
      vendedor {
        id_usuarios
        nombre
        apellido_paterno
        foto_perfil
      }
      comprador {
        id_usuarios
        nombre
        apellido_paterno
        foto_perfil
      }
    }
  }
`;

export const GET_MENSAJES_QUERY = `
  query {
    detalleMensajes {
      id_detalle_mensajes
      mensaje
      fecha_envio
      conversacion {
        id_conversaciones
      }
      emisor {
        id_usuarios
      }
    }
  }
`;

export const CREATE_CONVERSACION_MUTATION = `
  mutation CreateConversacion($input: CreateConversacionesInput!) {
    createConversacion(createConversacionesInput: $input) {
      id_conversaciones
      vendedor { id_usuarios nombre apellido_paterno foto_perfil }
      comprador { id_usuarios nombre apellido_paterno foto_perfil }
      publicacion { id_publicaciones titulo precio }
      fecha_creacion
    }
  }
`;

export const CREATE_MENSAJE_MUTATION = `
  mutation CreateMensaje($input: CreateDetalleMensajesInput!) {
    createDetalleMensaje(createDetalleMensajesInput: $input) {
      id_detalle_mensajes
      mensaje
      fecha_envio
      emisor { id_usuarios }
    }
  }
`;

// ── Catálogo ──────────────────────────────────────────────────────────────────

export const GET_PUBLICACIONES_QUERY = `
  query Publicaciones {
    publicaciones {
      id_publicaciones
      id_usuarios
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

export const MARCAR_VENDIDA_MUTATION = `
  mutation MarcarVendida($id: Int!) {
    updatePublicacion(id: $id, input: { disponible: false }) {
      id_publicaciones
      disponible
    }
  }
`;

export const CREATE_PUBLICACION_MUTATION = `
  mutation CreatePublicacion($input: CreatePublicacionesInput!) {
    createPublicacion(input: $input) {
      id_publicaciones
      titulo
      precio
      disponible
      fecha_publicacion
    }
  }
`;
