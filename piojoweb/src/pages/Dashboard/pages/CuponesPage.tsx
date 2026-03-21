import { useState } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import { historialCupones as initialData } from "../lib/mock-data";
import type { HistorialCupon } from "../lib/mock-data";

const columns: ColumnDef<HistorialCupon>[] = [
  { key: "id_historial_cupones", label: "ID", editable: false },
  { key: "monto", label: "Monto", type: "number" },
  { key: "fecha_expiracion", label: "Fecha Expiración", type: "date" },
];

export default function CuponesPage() {
  const [data, setData] = useState<HistorialCupon[]>(initialData);
  return (
    <CrudTable title="Cupones" data={data} columns={columns} idKey="id_historial_cupones"
      onAdd={(item) => setData([...data, { ...item, id_historial_cupones: data.length + 1 } as HistorialCupon])}
      onEdit={(item) => setData(data.map(d => d.id_historial_cupones === item.id_historial_cupones ? item : d))}
      onDelete={(id) => setData(data.filter(d => d.id_historial_cupones !== id))}
    />
  );
}
