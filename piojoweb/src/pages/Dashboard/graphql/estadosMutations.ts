export const CREATE_ESTADO = `
mutation CreateEstado($input: CreateEstadosInput!) {
  createEstado(input: $input) {
    id_estados
    nombre
  }
}
`;

export const UPDATE_ESTADO = `
mutation UpdateEstado($id: Int!, $input: UpdateEstadosInput!) {
  updateEstado(id: $id, input: $input) {
    id_estados
    nombre
  }
}
`;

export const REMOVE_ESTADO = `
mutation RemoveEstado($id: Int!) {
  removeEstado(id: $id)
}
`;

export default { CREATE_ESTADO, UPDATE_ESTADO, REMOVE_ESTADO };
