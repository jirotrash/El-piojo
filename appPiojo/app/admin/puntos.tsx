import React, { useEffect, useState } from 'react';
import AdminCrudScreen, { CrudConfig, SelectOption } from '../../src/components/AdminCrudScreen';
import { graphqlRequest } from '../../src/api/api';

export default function PuntosScreen() {
  const [munOpts, setMunOpts] = useState<SelectOption[]>([]);

  useEffect(() => {
    graphqlRequest<any>(`query { municipios { id_municipios nombre } }`)
      .then(d => setMunOpts(
        (d.municipios ?? []).map((m: any) => ({ label: m.nombre, value: m.id_municipios }))
      ))
      .catch(() => {});
  }, []);

  const config: CrudConfig = {
    title: 'Puntos de Entrega',
    queryKey: 'puntosEntrega',
    idField: 'id_puntos_entrega',
    listGql: `query { puntosEntrega { id_puntos_entrega nombre id_municipios latitud longitud descripcion } }`,
    createGql: `mutation CreatePuntoEntrega($input: CreatePuntosEntregaInput!) {
      createPuntoEntrega(input: $input) { id_puntos_entrega nombre }
    }`,
    updateGql: `mutation UpdatePuntoEntrega($id: Int!, $input: UpdatePuntosEntregaInput!) {
      updatePuntoEntrega(id: $id, input: $input) { id_puntos_entrega nombre }
    }`,
    deleteGql: `mutation RemovePuntoEntrega($id: Int!) { removePuntoEntrega(id: $id) }`,
    fields: [
      { key: 'nombre',         label: 'Nombre',      type: 'text',   required: true },
      { key: 'id_municipios',  label: 'Municipio',   type: 'select', required: true, options: munOpts },
      {
        key: '_mapa', label: 'Ubicación', type: 'map',
        mapKeys: { lat: 'latitud', lng: 'longitud' },
      },
      { key: 'latitud',        label: 'Latitud',     type: 'number', required: true },
      { key: 'longitud',       label: 'Longitud',    type: 'number', required: true },
      { key: 'descripcion',    label: 'Descripción', type: 'text',   multiline: true },
    ],
    rowTitle:    (item) => item.nombre,
    rowSubtitle: (item) => item.descripcion ?? `${item.latitud}, ${item.longitud}`,
  };

  return <AdminCrudScreen config={config} />;
}
