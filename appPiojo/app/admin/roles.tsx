import AdminCrudScreen, { CrudConfig } from '../../src/components/AdminCrudScreen';

const config: CrudConfig = {
  title: 'Roles',
  queryKey: 'roles',
  idField: 'id_roles',
  listGql: `query { roles { id_roles nombre } }`,
  createGql: `mutation CreateRole($input: CreateRolesInput!) {
    createRole(input: $input) { id_roles nombre }
  }`,
  updateGql: `mutation UpdateRole($id: Int!, $input: UpdateRolesInput!) {
    updateRole(id: $id, input: $input) { id_roles nombre }
  }`,
  deleteGql: `mutation RemoveRole($id: Int!) { removeRole(id: $id) }`,
  fields: [
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
  ],
  rowTitle: (item) => item.nombre,
  rowSubtitle: (item) => `ID: ${item.id_roles}`,
};

export default function RolesScreen() {
  return <AdminCrudScreen config={config} />;
}
