import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { HistorialCupon } from "../lib/mock-data";
import useHistorialCuponesApi from "../hooks/useHistorialCuponesApi";
import useHistorialCuponesMutations from "../hooks/useHistorialCuponesMutations";

export default function CuponesPage() {
  const { data: cuponesData = [], refetch } = useHistorialCuponesApi();
  const { createHistorialCupon, updateHistorialCupon, removeHistorialCupon } = useHistorialCuponesMutations();

  const [data, setData] = useState<HistorialCupon[]>(cuponesData);
  useEffect(() => { setData(cuponesData); }, [cuponesData]);

  const columns: ColumnDef<HistorialCupon>[] = [
    { key: "id_historial_cupones", label: "ID", editable: false },
    { key: "monto", label: "Monto", type: "number" },
    { key: "fecha_expiracion", label: "Fecha Expiración", type: "date" },
  ];

  return (
    <CrudTable title="Cupones" data={data} columns={columns} idKey="id_historial_cupones"
      onAdd={async (item) => {
        try {
          await createHistorialCupon(item as Record<string, any>);
          await refetch();
        } catch (err) { console.error(err); }
      }}
      onEdit={async (item) => {
        try {
          await updateHistorialCupon(Number((item as any).id_historial_cupones), item as Record<string, any>);
          await refetch();
        } catch (err) { console.error(err); }
      }}
      onDelete={async (id) => {
        try {
          await removeHistorialCupon(Number(id));
          await refetch();
        } catch (err) { console.error(err); }
      }}
    />
  );
}
