import { useState } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import { detalleVentas as initialData, publicaciones } from "../lib/mock-data";
import type { DetalleVenta } from "../lib/mock-data";

const columns: ColumnDef<DetalleVenta>[] = [
  { key: "id_detalle_venta", label: "ID", editable: false },
  { key: "id_pagos", label: "Pago #", type: "number" },
  { key: "id_publicaciones", label: "Publicación", type: "select", options: publicaciones.map(p => ({ value: String(p.id_publicaciones), label: p.titulo })) },
  { key: "cantidad", label: "Cantidad", type: "number" },
  { key: "subtotal", label: "Subtotal", type: "number" },
];

export default function DetalleVentasPage() {
  const [data, setData] = useState<DetalleVenta[]>(initialData);
  return (
    <CrudTable title="Detalle de Ventas" data={data} columns={columns} idKey="id_detalle_venta"
      onAdd={(item) => setData([...data, { ...item, id_detalle_venta: data.length + 1 } as DetalleVenta])}
      onEdit={(item) => setData(data.map(d => d.id_detalle_venta === item.id_detalle_venta ? item : d))}
      onDelete={(id) => setData(data.filter(d => d.id_detalle_venta !== id))}
    />
  );
}
