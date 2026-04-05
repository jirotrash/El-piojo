import AdminCrudScreen, { CrudConfig } from '../../src/components/AdminCrudScreen';

const config: CrudConfig = {
  title: 'Mensajes',
  queryKey: 'detalleMensajes',
  idField: 'id_detalle_mensajes',
  listGql: `query { detalleMensajes {
    id_detalle_mensajes mensaje fecha_envio
    emisor { id_usuarios nombre apellido_paterno }
    conversacion { id_conversaciones }
  } }`,
  fields: [],
  rowTitle:    (item) => item.mensaje,
  rowSubtitle: (item) =>
    `#${item.id_detalle_mensajes} · ${item.emisor?.nombre ?? '?'} · ${item.conversacion?.id_conversaciones ?? '?'}`,
};

export default function MensajesScreen() {
  return <AdminCrudScreen config={config} />;
}
