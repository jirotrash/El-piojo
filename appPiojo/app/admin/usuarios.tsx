import AdminCrudScreen, { CrudConfig } from '../../src/components/AdminCrudScreen';

const config: CrudConfig = {
  title: 'Usuarios',
  queryKey: 'usuarios',
  idField: 'id_usuarios',
  listGql: `query { usuarios {
    id_usuarios nombre apellido_paterno apellido_materno
    email telefono matricula id_roles id_carreras id_municipios
  } }`,
  updateGql: `mutation UpdateUsuario($id: Int!, $input: UpdateUsuariosInput!) {
    updateUsuario(id: $id, input: $input) { id_usuarios nombre email }
  }`,
  deleteGql: `mutation RemoveUsuario($id: Int!) { removeUsuario(id: $id) }`,
  fields: [
    { key: 'nombre',           label: 'Nombre',           type: 'text',   required: true },
    { key: 'apellido_paterno', label: 'Apellido paterno', type: 'text',   required: true },
    { key: 'apellido_materno', label: 'Apellido materno', type: 'text'   },
    { key: 'email',            label: 'Email',            type: 'email',  required: true },
    { key: 'password',         label: 'Nueva contraseña', type: 'text',   secureText: true },
    { key: 'telefono',         label: 'Teléfono',         type: 'text'   },
    { key: 'matricula',        label: 'Matrícula',        type: 'text'   },
    { key: 'id_roles',         label: 'ID Rol',           type: 'number' },
    { key: 'id_carreras',      label: 'ID Carrera',       type: 'number' },
    { key: 'id_municipios',    label: 'ID Municipio',     type: 'number' },
    { key: 'direccion',        label: 'Dirección',        type: 'text',   multiline: true },
  ],
  rowTitle:    (item) => `${item.nombre} ${item.apellido_paterno}`,
  rowSubtitle: (item) => item.email,
};

export default function UsuariosScreen() {
  return <AdminCrudScreen config={config} />;
}
