import AdminCrudScreen, { CrudConfig } from '../../src/components/AdminCrudScreen';

const METODO_OPTS = [
  { label: 'Efectivo',       value: 'EFECTIVO'      },
  { label: 'Transferencia',  value: 'TRANSFERENCIA' },
];

const ESTADO_OPTS = [
  { label: 'Pendiente',   value: 'PENDIENTE'   },
  { label: 'Completado',  value: 'COMPLETADO'  },
  { label: 'Rechazado',   value: 'RECHAZADO'   },
];

const config: CrudConfig = {
  title: 'Pagos',
  queryKey: 'pagos',
  idField: 'id_pagos',
  listGql: `query { pagos {
    id_pagos total total_con_descuento metodo_pago estado fecha_pago url_comprobante
  } }`,
  createGql: `mutation CreatePago($input: CreatePagosInput!) {
    createPago(createPagosInput: $input) { id_pagos total estado }
  }`,
  fields: [
    { key: 'total',              label: 'Total',           type: 'number', required: true },
    { key: 'total_con_descuento',label: 'Total c/descuento',type: 'number', required: true },
    { key: 'metodo_pago',        label: 'Método de pago',  type: 'select', required: true, options: METODO_OPTS },
    { key: 'estado',             label: 'Estado',          type: 'select', options: ESTADO_OPTS },
    { key: 'id_usuarios_pagador',label: 'ID Usuario',      type: 'number', required: true },
    { key: 'url_comprobante',    label: 'URL Comprobante', type: 'text'  },
  ],
  rowTitle:    (item) => `Pago #${item.id_pagos} · $${item.total}`,
  rowSubtitle: (item) => `${item.metodo_pago} · ${item.estado}`,
};

export default function PagosScreen() {
  return <AdminCrudScreen config={config} />;
}
