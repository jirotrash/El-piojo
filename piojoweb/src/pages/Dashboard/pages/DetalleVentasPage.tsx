import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { DetalleVenta } from "../lib/mock-data";
import useDetalleVentaApi from "../hooks/useDetalleVentaApi";
import usePublicacionesApi from "../hooks/usePublicacionesApi";
import useDetalleVentaMutations from "../hooks/useDetalleVentaMutations";

export default function DetalleVentasPage() {
  const { data: detalleVentasData = [], refetch } = useDetalleVentaApi();
  const { data: publicacionesData = [] } = usePublicacionesApi();
  const { createDetalleVenta, updateDetalleVenta, removeDetalleVenta } = useDetalleVentaMutations();

  const [data, setData] = useState<DetalleVenta[]>(detalleVentasData);
  useEffect(() => { setData(detalleVentasData); }, [detalleVentasData]);

  const columns: ColumnDef<DetalleVenta>[] = [
    { key: "id_detalle_venta", label: "ID", editable: false },
    { key: "id_pagos", label: "Pago #", type: "number" },
    { key: "id_publicaciones", label: "Publicación", type: "select", options: publicacionesData.map((p: any) => ({ value: String(p.id_publicaciones), label: p.titulo })) },
    { key: "cantidad", label: "Cantidad", type: "number" },
    { key: "subtotal", label: "Subtotal", type: "number" },
  ];

  return (
    <CrudTable title="Detalle de Ventas" data={data} columns={columns} idKey="id_detalle_venta"
      onAdd={async (item) => {
        try {
          await createDetalleVenta(item as Record<string, any>);
          await refetch();
        } catch (err) { console.error(err); }
      }}
      onEdit={async (item) => {
        try {
          await updateDetalleVenta(Number((item as any).id_detalle_venta), item as Record<string, any>);
          await refetch();
        } catch (err) { console.error(err); }
      }}
      onDelete={async (id) => {
        try {
          await removeDetalleVenta(Number(id));
          await refetch();
        } catch (err) { console.error(err); }
      }}
    />
  );
}
