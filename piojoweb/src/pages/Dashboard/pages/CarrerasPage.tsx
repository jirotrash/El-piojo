import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { Carrera } from "../lib/mock-data";
import useCarrerasApi from "../hooks/useCarrerasApi";
import useCarrerasMutations from "../hooks/useCarrerasMutations";

const columns: ColumnDef<Carrera>[] = [
  { key: "id_carreras", label: "ID", editable: false },
  { key: "nombre", label: "Nombre" },
  { key: "universidad", label: "Universidad" },
];

export default function CarrerasPage() {
  const { data: carrerasData = [], refetch } = useCarrerasApi();
  const [data, setData] = useState<Carrera[]>(carrerasData);
  useEffect(() => { setData(carrerasData); }, [carrerasData]);
  const { createCarrera, updateCarrera, removeCarrera } = useCarrerasMutations();
  return (
    <CrudTable title="Carreras" data={data} columns={columns} idKey="id_carreras"
      onAdd={async (item) => {
        const payload = { nombre: String(item.nombre ?? ""), universidad: String(item.universidad ?? "") };
        try { await createCarrera(payload); await refetch(); } catch (err) { console.error(err); }
      }}
      onEdit={async (item) => {
        const id = Number((item as any).id_carreras ?? 0);
        const payload = { nombre: String(item.nombre ?? ""), universidad: String(item.universidad ?? "") };
        try { await updateCarrera(id, payload); await refetch(); } catch (err) { console.error(err); }
      }}
      onDelete={async (id) => { try { await removeCarrera(Number(id)); await refetch(); } catch (err) { console.error(err); } }}
    />
  );
}
