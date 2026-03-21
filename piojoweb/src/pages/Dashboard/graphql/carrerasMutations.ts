export const CREATE_CARRERA = `
  mutation CreateCarrera($input: CreateCarreraInput!) {
    createCarrera(input: $input) {
      id_carreras
      nombre
      universidad
    }
  }
`;

export const UPDATE_CARRERA = `
  mutation UpdateCarrera($id: Int!, $input: UpdateCarreraInput!) {
    updateCarrera(id: $id, input: $input) {
      id_carreras
      nombre
      universidad
    }
  }
`;

export const REMOVE_CARRERA = `
  mutation RemoveCarrera($id: Int!) {
    removeCarrera(id: $id)
  }
`;

export default { CREATE_CARRERA, UPDATE_CARRERA, REMOVE_CARRERA };
