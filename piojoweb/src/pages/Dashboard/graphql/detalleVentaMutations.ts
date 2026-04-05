export const CREATE_DETALLE_VENTA = `
  mutation CreateDetalleVenta($createDetalleVentaInput: CreateDetalleVentaInput!) {
    createDetalleVenta(createDetalleVentaInput: $createDetalleVentaInput) {
      id_detalle_venta
      id_pagos
      id_publicaciones
      cantidad
      subtotal
    }
  }
`;

export const UPDATE_DETALLE_VENTA = `
  mutation UpdateDetalleVenta($id: Int!, $input: UpdateDetalleVentaInput!) {
    updateDetalleVenta(id: $id, updateDetalleVentaInput: $input) {
      id_detalle_venta
      id_pagos
      id_publicaciones
      cantidad
      subtotal
    }
  }
`;

export const REMOVE_DETALLE_VENTA = `
  mutation RemoveDetalleVenta($id: Int!) {
    removeDetalleVenta(id: $id)
  }
`;

export default { CREATE_DETALLE_VENTA, UPDATE_DETALLE_VENTA, REMOVE_DETALLE_VENTA };
