import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { Estado } from "../lib/mock-data";
import useEstadosApi from "../hooks/useEstadosApi";
import useEstadosMutations from "../hooks/useEstadosMutations";

const columns: ColumnDef<Estado>[] = [
  { key: "id_estados", label: "ID", editable: false },
  { key: "nombre", label: "Nombre" },
];

export default function EstadosPage() {
  const { data: estadosData = [], refetch } = useEstadosApi();
  const [data, setData] = useState<Estado[]>(estadosData);
  const { createEstado, updateEstado, removeEstado } = useEstadosMutations();

  useEffect(() => { setData(estadosData); }, [estadosData]);

  const handleAdd = async (item: Partial<Estado>) => {
    try {
      // call backend
      await createEstado({ nombre: item.nombre });
      await refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = async (item: Estado) => {
    try {
      await updateEstado(Number(item.id_estados), { nombre: item.nombre });
      await refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeEstado(Number(id));
      await refetch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CrudTable title="Estados" data={data} columns={columns} idKey="id_estados"
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
