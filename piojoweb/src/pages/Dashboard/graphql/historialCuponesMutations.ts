export const CREATE_HISTORIAL_CUPON = `
  mutation CreateHistorialCupon($input: CreateHistorialCuponesInput!) {
    createHistorialCupon(createHistorialCuponesInput: $input) {
      id_historial_cupones
      monto
      fecha_expiracion
    }
  }
`;

export const UPDATE_HISTORIAL_CUPON = `
  mutation UpdateHistorialCupon($id: Int!, $input: UpdateHistorialCuponesInput!) {
    updateHistorialCupon(id: $id, updateHistorialCuponesInput: $input) {
      id_historial_cupones
      monto
      fecha_expiracion
    }
  }
`;

export const REMOVE_HISTORIAL_CUPON = `
  mutation RemoveHistorialCupon($id: Int!) {
    removeHistorialCupon(id: $id)
  }
`;

export default { CREATE_HISTORIAL_CUPON, UPDATE_HISTORIAL_CUPON, REMOVE_HISTORIAL_CUPON };
