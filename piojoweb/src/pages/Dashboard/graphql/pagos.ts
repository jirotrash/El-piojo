export const PAGOS_QUERY = `
  query Pagos {
    pagos {
      id_pagos
      total
      total_con_descuento
      metodo_pago
      estado
      fecha_pago
      url_comprobante
    }
  }
`;

export const CREATE_PAGO_MUTATION = `
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

export const CREATE_DETALLE_VENTA_MUTATION = `
  mutation CreateDetalleVenta($createDetalleVentaInput: CreateDetalleVentaInput!) {
    createDetalleVenta(createDetalleVentaInput: $createDetalleVentaInput) {
      id_detalle_venta
      cantidad
      subtotal
    }
  }
`;
