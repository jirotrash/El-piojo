export const CREATE_USUARIO = `
mutation CreateUsuario($input: CreateUsuarioInput!) {
  createUsuario(createUsuarioInput: $input) {
    id_usuarios
    nombre
    apellido_paterno
    apellido_materno
    email
    telefono
    matricula
    foto_perfil
    direccion
    fecha_registro
  }
}
`;

export const UPDATE_USUARIO = `
mutation UpdateUsuario($id: Int!, $input: UpdateUsuarioInput!) {
  updateUsuario(updateUsuarioInput: $input) {
    id_usuarios
    nombre
    apellido_paterno
    apellido_materno
    email
    telefono
    matricula
    foto_perfil
    direccion
    fecha_registro
  }
}
`;

export const REMOVE_USUARIO = `
mutation RemoveUsuario($id: Int!) {
  removeUsuario(id: $id)
}
`;

export default { CREATE_USUARIO, UPDATE_USUARIO, REMOVE_USUARIO };
