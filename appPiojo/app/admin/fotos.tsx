import AdminCrudScreen, { CrudConfig } from '../../src/components/AdminCrudScreen';

const config: CrudConfig = {
  title: 'Fotos de Publicaciones',
  queryKey: 'detallePublicaciones',
  idField: 'id_detalle_publicaciones',
  listGql: `query { detallePublicaciones { id_detalle_publicaciones id_publicaciones url_foto es_portada } }`,
  deleteGql: `mutation RemoveDetallePublicacion($id: Int!) { removeDetallePublicacion(id: $id) }`,
  updateGql: `mutation UpdateDetallePublicacion($id: Int!, $input: UpdateDetallePublicacionesInput!) {
    updateDetallePublicacion(id: $id, input: $input) { id_detalle_publicaciones }
  }`,
  fields: [
    { key: 'url_foto',    label: 'URL de foto', type: 'text',    required: true },
    { key: 'es_portada',  label: 'Es portada',  type: 'boolean' },
  ],
  rowTitle:    (item) => `Foto #${item.id_detalle_publicaciones}`,
  rowSubtitle: (item) => `Pub. ${item.id_publicaciones} · ${item.es_portada ? 'Portada' : 'Galería'}`,
};

export default function FotosScreen() {
  return <AdminCrudScreen config={config} />;
}
