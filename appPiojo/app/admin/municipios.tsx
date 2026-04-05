import React, { useEffect, useState } from 'react';
import AdminCrudScreen, { CrudConfig, SelectOption } from '../../src/components/AdminCrudScreen';
import { graphqlRequest } from '../../src/api/api';

export default function MunicipiosScreen() {
  const [estadoOpts, setEstadoOpts] = useState<SelectOption[]>([]);

  useEffect(() => {
    graphqlRequest<any>(`query { estados { id_estados nombre } }`)
      .then(d => setEstadoOpts(
        (d.estados ?? []).map((e: any) => ({ label: e.nombre, value: e.id_estados }))
      ))
      .catch(() => {});
  }, []);

  const config: CrudConfig = {
    title: 'Municipios',
    queryKey: 'municipios',
    idField: 'id_municipios',
    listGql: `query { municipios { id_municipios id_estados nombre } }`,
    createGql: `mutation CreateMunicipio($input: CreateMunicipiosInput!) {
      createMunicipio(input: $input) { id_municipios nombre }
    }`,
    updateGql: `mutation UpdateMunicipio($id: Int!, $input: UpdateMunicipiosInput!) {
      updateMunicipio(id: $id, input: $input) { id_municipios nombre }
    }`,
    deleteGql: `mutation RemoveMunicipio($id: Int!) { removeMunicipio(id: $id) }`,
    fields: [
      { key: 'nombre',     label: 'Nombre',  type: 'text',   required: true },
      { key: 'id_estados', label: 'Estado',  type: 'select', required: true, options: estadoOpts },
    ],
    rowTitle:    (item) => item.nombre,
    rowSubtitle: (item) => `Estado ID: ${item.id_estados}`,
  };

  return <AdminCrudScreen config={config} />;
}
