import AdminCrudScreen, { CrudConfig } from '../../src/components/AdminCrudScreen';

const config: CrudConfig = {
  title: 'Historial de Tratos',
  queryKey: 'historialTratos',
  idField: 'id_historial_tratos',
  listGql: `query { historialTratos {
    id_historial_tratos fecha_cierre calificacion comentario
  } }`,
  fields: [],
  rowTitle:    (item) => `Trato #${item.id_historial_tratos}`,
  rowSubtitle: (item) =>
    `${item.calificacion ? '⭐ ' + item.calificacion : 'Sin calificación'} · ${item.fecha_cierre?.split('T')[0] ?? ''}`,
};

export default function TratosScreen() {
  return <AdminCrudScreen config={config} />;
}
