import gql from '../../../api/gqlClient';
import { CREATE_PAGO_MUTATION, CREATE_DETALLE_VENTA_MUTATION } from '../graphql/pagos';

export interface CreatePagosInput {
  id_usuarios_pagador: number;
  total: number;
  total_con_descuento: number;
  metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA';
  estado?: 'PENDIENTE' | 'COMPLETADO' | 'RECHAZADO';
}

export interface CreateDetalleVentaInput {
  id_pagos: number;
  id_publicaciones: number;
  cantidad?: number;
  subtotal: number;
}

export function usePagosMutations() {
  const createPago = async (input: CreatePagosInput) => {
    const res = await gql<{ createPago: any }>(CREATE_PAGO_MUTATION, { createPagosInput: input });
    return res.createPago;
  };

  const createDetalleVenta = async (input: CreateDetalleVentaInput) => {
    const res = await gql<{ createDetalleVenta: any }>(CREATE_DETALLE_VENTA_MUTATION, { createDetalleVentaInput: input });
    return res.createDetalleVenta;
  };

  return { createPago, createDetalleVenta };
}

export default usePagosMutations;
