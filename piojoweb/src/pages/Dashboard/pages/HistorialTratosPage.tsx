import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { HistorialTrato } from "../lib/mock-data";
import useHistorialTratosApi from "../hooks/useHistorialTratosApi";
import useUsuarioApi from "../hooks/useUsuarioApi";

export default function HistorialTratosPage() {
  const { data: historialData = [] } = useHistorialTratosApi();
  const { data: usuariosData = [] } = useUsuarioApi();

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
      onAdd={(item) => setData([...data, { ...item, id_historial_tratos: data.length + 1 } as HistorialTrato])}
      onEdit={(item) => setData(data.map(d => d.id_historial_tratos === item.id_historial_tratos ? item : d))}
      onDelete={(id) => setData(data.filter(d => d.id_historial_tratos !== id))}
    />
  );
}
