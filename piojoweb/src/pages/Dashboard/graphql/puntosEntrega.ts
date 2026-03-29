export const PUNTOS_ENTREGA_QUERY = `
  query PuntosEntrega {
    puntosEntrega {
      id_puntos_entrega
      id_municipios
      nombre
      latitud
      longitud
      descripcion
    }
  }
`;
