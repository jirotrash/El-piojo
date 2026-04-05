export const CREATE_HISTORIAL_TRATO = `
  mutation CreateHistorialTrato($input: CreateHistorialTratosInput!) {
    createHistorialTrato(createHistorialTratosInput: $input) {
      id_historial_tratos
      id_pagos
      id_vendedor
      id_comprador
      fecha_cierre
      calificacion
      comentario
    }
  }
`;

export const UPDATE_HISTORIAL_TRATO = `
  mutation UpdateHistorialTrato($id: Int!, $input: UpdateHistorialTratosInput!) {
    updateHistorialTrato(id: $id, updateHistorialTratosInput: $input) {
      id_historial_tratos
      id_pagos
      id_vendedor
      id_comprador
      fecha_cierre
      calificacion
      comentario
    }
  }
`;

export const REMOVE_HISTORIAL_TRATO = `
  mutation RemoveHistorialTrato($id: Int!) {
    removeHistorialTrato(id: $id)
  }
`;

export default { CREATE_HISTORIAL_TRATO, UPDATE_HISTORIAL_TRATO, REMOVE_HISTORIAL_TRATO };
