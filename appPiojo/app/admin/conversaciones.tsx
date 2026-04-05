import AdminCrudScreen, { CrudConfig } from '../../src/components/AdminCrudScreen';

const config: CrudConfig = {
  title: 'Conversaciones',
  queryKey: 'conversaciones',
  idField: 'id_conversaciones',
  listGql: `query { conversaciones {
    id_conversaciones fecha_creacion
    vendedor { id_usuarios nombre apellido_paterno }
    comprador { id_usuarios nombre apellido_paterno }
    publicacion { id_publicaciones titulo }
  } }`,
  // solo lectura + delete
  deleteGql: ``,  // no hay removeConversacion en el backend; omitimos
  fields: [],
  rowTitle:    (item) =>
    `#${item.id_conversaciones} · ${item.publicacion?.titulo ?? '—'}`,
  rowSubtitle: (item) =>
    `${item.vendedor?.nombre ?? '?'} → ${item.comprador?.nombre ?? '?'}`,
};

export default function ConversacionesScreen() {
  return <AdminCrudScreen config={config} />;
}
