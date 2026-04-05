export const CREATE_PAGO = `
  mutation CreatePago($createPagosInput: CreatePagosInput!) {
    createPago(createPagosInput: $createPagosInput) {
      id_pagos
      total
      total_con_descuento
      metodo_pago
      estado
      fecha_pago
    }
  }
`;

export const UPDATE_PAGO = `
  mutation UpdatePago($id: Int!, $input: UpdatePagosInput!) {
    updatePago(id: $id, updatePagosInput: $input) {
      id_pagos
      total
      total_con_descuento
      metodo_pago
      estado
      fecha_pago
    }
  }
`;

export const REMOVE_PAGO = `
  mutation RemovePago($id: Int!) {
    removePago(id: $id)
  }
`;

export default { CREATE_PAGO, UPDATE_PAGO, REMOVE_PAGO };
