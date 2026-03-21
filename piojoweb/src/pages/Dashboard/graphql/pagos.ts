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
