export const HISTORIAL_CUPONES_QUERY = `
query HistorialCupones {
  historialCupones {
    id_historial
    id_cupon
    id_usuarios
    fecha
    monto
    tipo
  }
}
`;

export default HISTORIAL_CUPONES_QUERY;
export const HISTORIAL_CUPONES_QUERY = `
  query HistorialCupones {
    historialCupones {
      id_historial_cupones
      monto
      fecha_expiracion
    }
  }
`;
