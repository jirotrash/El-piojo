export const CREATE_MUNICIPIO = `
mutation CreateMunicipio($input: CreateMunicipiosInput!) {
  createMunicipio(input: $input) {
    id_municipios
    nombre
    id_estados
  }
}
`;

export const UPDATE_MUNICIPIO = `
mutation UpdateMunicipio($id: Int!, $input: UpdateMunicipiosInput!) {
  updateMunicipio(id: $id, input: $input) {
    id_municipios
    nombre
    id_estados
  }
}
`;

export const REMOVE_MUNICIPIO = `
mutation RemoveMunicipio($id: Int!) {
  removeMunicipio(id: $id)
}
`;

export default { CREATE_MUNICIPIO, UPDATE_MUNICIPIO, REMOVE_MUNICIPIO };
