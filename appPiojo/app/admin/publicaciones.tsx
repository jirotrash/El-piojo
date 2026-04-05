import AdminCrudScreen, { CrudConfig } from '../../src/components/AdminCrudScreen';

const GENERO_OPTS = [
  { label: 'Hombre',    value: 'HOMBRE'    },
  { label: 'Mujer',     value: 'MUJER'     },
  { label: 'Unisex',    value: 'UNISEX'    },
  { label: 'Académico', value: 'ACADEMICO' },
];

const ESTADO_USO_OPTS = [
  { label: 'Nuevo', value: 'NUEVO' },
  { label: 'Bueno', value: 'BUENO' },
  { label: 'Usado', value: 'USADO' },
];

const config: CrudConfig = {
  title: 'Publicaciones',
  queryKey: 'publicaciones',
  idField: 'id_publicaciones',
  listGql: `query { publicaciones {
    id_publicaciones titulo categoria genero estado_uso precio disponible
    id_usuarios id_puntos_entrega talla marca color descripcion
  } }`,
  updateGql: `mutation UpdatePublicacion($id: Int!, $input: UpdatePublicacionesInput!) {
    updatePublicacion(id: $id, input: $input) { id_publicaciones titulo }
  }`,
  deleteGql: `mutation RemovePublicacion($id: Int!) { removePublicacion(id: $id) }`,
  fields: [
    { key: 'titulo',           label: 'Título',        type: 'text',   required: true },
    { key: 'descripcion',      label: 'Descripción',   type: 'text',   multiline: true },
    { key: 'categoria',        label: 'Categoría',     type: 'text',   required: true },
    { key: 'talla',            label: 'Talla',         type: 'text'   },
    { key: 'marca',            label: 'Marca',         type: 'text'   },
    { key: 'color',            label: 'Color',         type: 'text'   },
    { key: 'genero',           label: 'Género',        type: 'select', required: true, options: GENERO_OPTS },
    { key: 'estado_uso',       label: 'Estado de uso', type: 'select', required: true, options: ESTADO_USO_OPTS },
    { key: 'precio',           label: 'Precio',        type: 'number' },
    { key: 'disponible',       label: 'Disponible',    type: 'boolean' },
    { key: 'id_puntos_entrega',label: 'ID Punto entrega', type: 'number' },
  ],
  rowTitle:    (item) => item.titulo,
  rowSubtitle: (item) => `${item.categoria} · $${item.precio} · ${item.disponible ? 'Disponible' : 'No disponible'}`,
};

export default function PublicacionesScreen() {
  return <AdminCrudScreen config={config} />;
}
