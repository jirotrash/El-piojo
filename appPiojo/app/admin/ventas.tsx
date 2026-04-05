import AdminCrudScreen, { CrudConfig } from '../../src/components/AdminCrudScreen';

const config: CrudConfig = {
  title: 'Detalle de Ventas',
  queryKey: 'detalleVenta',
  idField: 'id_detalle_venta',
  listGql: `query { detalleVenta { id_detalle_venta cantidad subtotal } }`,
  fields: [],
  rowTitle:    (item) => `Venta #${item.id_detalle_venta}`,
  rowSubtitle: (item) => `Cant: ${item.cantidad} · Subtotal: $${item.subtotal}`,
};

export default function VentasScreen() {
  return <AdminCrudScreen config={config} />;
}
