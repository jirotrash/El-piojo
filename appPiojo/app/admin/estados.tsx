import AdminCrudScreen, { CrudConfig } from '../../src/components/AdminCrudScreen';

const config: CrudConfig = {
  title: 'Estados',
  queryKey: 'estados',
  idField: 'id_estados',
  listGql: `query { estados { id_estados nombre } }`,
  createGql: `mutation CreateEstado($input: CreateEstadosInput!) {
    createEstado(input: $input) { id_estados nombre }
  }`,
  updateGql: `mutation UpdateEstado($id: Int!, $input: UpdateEstadosInput!) {
    updateEstado(id: $id, input: $input) { id_estados nombre }
  }`,
  deleteGql: `mutation RemoveEstado($id: Int!) { removeEstado(id: $id) }`,
  fields: [
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
  ],
  rowTitle: (item) => item.nombre,
  rowSubtitle: (item) => `ID: ${item.id_estados}`,
};

export default function EstadosScreen() {
  return <AdminCrudScreen config={config} />;
}
