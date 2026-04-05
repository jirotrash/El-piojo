import AdminCrudScreen, { CrudConfig } from '../../src/components/AdminCrudScreen';

const config: CrudConfig = {
  title: 'Carreras',
  queryKey: 'carreras',
  idField: 'id_carreras',
  listGql: `query { carreras { id_carreras nombre universidad } }`,
  createGql: `mutation CreateCarrera($input: CreateCarreraInput!) {
    createCarrera(input: $input) { id_carreras nombre universidad }
  }`,
  updateGql: `mutation UpdateCarrera($id: Int!, $input: UpdateCarreraInput!) {
    updateCarrera(id: $id, input: $input) { id_carreras nombre universidad }
  }`,
  deleteGql: `mutation RemoveCarrera($id: Int!) { removeCarrera(id: $id) }`,
  fields: [
    { key: 'nombre',      label: 'Nombre',      type: 'text', required: true },
    { key: 'universidad', label: 'Universidad',  type: 'text', required: true },
  ],
  rowTitle:    (item) => item.nombre,
  rowSubtitle: (item) => item.universidad,
};

export default function CarrerasScreen() {
  return <AdminCrudScreen config={config} />;
}
