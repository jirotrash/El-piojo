import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { HistorialTrato } from "../lib/mock-data";
import useHistorialTratosApi from "../hooks/useHistorialTratosApi";
import useUsuarioApi from "../hooks/useUsuarioApi";
import useHistorialTratosMutations from "../hooks/useHistorialTratosMutations";

export default function HistorialTratosPage() {
  const { data: historialData = [], refetch } = useHistorialTratosApi();
  const { data: usuariosData = [] } = useUsuarioApi();
  const { createHistorialTrato, updateHistorialTrato, removeHistorialTrato } = useHistorialTratosMutations();

  const [data, setData] = useState<HistorialTrato[]>(historialData);
  useEffect(() => { setData(historialData); }, [historialData]);

  const usuarioOptions = usuariosData.map(u => ({ value: String((u as any).id_usuarios ?? (u as any).id), label: `${(u as any).nombre ?? ''} ${(u as any).apellido_paterno ?? ''}` }));

  const columns: ColumnDef<HistorialTrato>[] = [
    { key: "id_historial_tratos", label: "ID", editable: false },
    { key: "id_pagos", label: "Pago #", type: "number" },
    { key: "id_vendedor", label: "Vendedor", type: "select", options: usuarioOptions },
    { key: "id_comprador", label: "Comprador", type: "select", options: usuarioOptions },
    { key: "fecha_cierre", label: "Fecha Cierre", type: "date" },
    { key: "calificacion", label: "Calificación", type: "number" },
    { key: "comentario", label: "Comentario" },
  ];

  return (
    <CrudTable title="Historial de Tratos" data={data} columns={columns} idKey="id_historial_tratos"
      onAdd={async (item) => {
        try {
          await createHistorialTrato(item as Record<string, any>);
          await refetch();
        } catch (err) { console.error(err); }
      }}
      onEdit={async (item) => {
        try {
          await updateHistorialTrato(Number((item as any).id_historial_tratos), item as Record<string, any>);
          await refetch();
        } catch (err) { console.error(err); }
      }}
      onDelete={async (id) => {
        try {
          await removeHistorialTrato(Number(id));
          await refetch();
        } catch (err) { console.error(err); }
      }}
    />
  );
}
