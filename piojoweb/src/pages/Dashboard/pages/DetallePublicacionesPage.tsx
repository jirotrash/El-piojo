import { useState } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import { detallePublicaciones as initialData, publicaciones } from "../lib/mock-data";
import type { DetallePublicacion } from "../lib/mock-data";

const columns: ColumnDef<DetallePublicacion>[] = [
  { key: "id_detalle_publicaciones", label: "ID", editable: false },
  { key: "id_publicaciones", label: "Publicación", type: "select", options: publicaciones.map(p => ({ value: String(p.id_publicaciones), label: p.titulo })) },
  { key: "url_foto", label: "URL Foto" },
  { key: "es_portada", label: "Es Portada", type: "boolean" },
];

export default function DetallePublicacionesPage() {
  const [data, setData] = useState<DetallePublicacion[]>(initialData);
  return (
    <CrudTable title="Fotos de Publicaciones" data={data} columns={columns} idKey="id_detalle_publicaciones"
      onAdd={(item) => setData([...data, { ...item, id_detalle_publicaciones: data.length + 1 } as DetallePublicacion])}
      onEdit={(item) => setData(data.map(d => d.id_detalle_publicaciones === item.id_detalle_publicaciones ? item : d))}
      onDelete={(id) => setData(data.filter(d => d.id_detalle_publicaciones !== id))}
    />
  );
}
