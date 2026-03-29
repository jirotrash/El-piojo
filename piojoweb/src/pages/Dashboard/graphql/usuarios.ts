export const USUARIOS_QUERY = `
  query Usuarios($page: Int, $limit: Int) {
    usuarios(page: $page, limit: $limit) {
      id_usuarios
      id_roles
      id_carreras
      id_municipios
      nombre
      email
      apellido_paterno
      apellido_materno
      foto_perfil
      telefono
      direccion
      matricula
      fecha_registro
    }
  }
`;
