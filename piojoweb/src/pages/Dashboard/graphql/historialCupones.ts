export const HISTORIAL_CUPONES_QUERY = `
  query HistorialCupones {
    historialCupones {
      id_historial_cupones
      monto
      fecha_expiracion
    }
  }
`;

export default HISTORIAL_CUPONES_QUERY;
