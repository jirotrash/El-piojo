export const CREATE_PUNTO_ENTREGA = `
  mutation CreatePuntoEntrega($input: CreatePuntosEntregaInput!) {
    createPuntoEntrega(input: $input) {
      id_puntos_entrega
      nombre
      id_municipios
      latitud
      longitud
      descripcion
    }
  }
`;

export const UPDATE_PUNTO_ENTREGA = `
  mutation UpdatePuntoEntrega($id: Int!, $input: UpdatePuntosEntregaInput!) {
    updatePuntoEntrega(id: $id, input: $input) {
      id_puntos_entrega
      nombre
      id_municipios
      latitud
      longitud
      descripcion
    }
  }
`;

export const REMOVE_PUNTO_ENTREGA = `
  mutation RemovePuntoEntrega($id: Int!) {
    removePuntoEntrega(id: $id)
  }
`;
