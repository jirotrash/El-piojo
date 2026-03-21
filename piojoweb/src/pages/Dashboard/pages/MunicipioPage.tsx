import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { Municipio } from "../lib/mock-data";
import useMunicipiosApi from "../hooks/useMunicipiosApi";
import useMunicipiosMutations from "../hooks/useMunicipiosMutations";
import useEstadosApi from "../hooks/useEstadosApi";

const columns = (estados: any[]): ColumnDef<Municipio>[] => [
  { key: "id_municipios", label: "ID", editable: false },
  { key: "nombre", label: "Nombre" },
  { key: "id_estados", label: "Estado", type: "select", options: estados.map(e => ({ value: String(e.id_estados), label: e.nombre })) },
];

export default function MunicipiosPage() {
  const { data: municipiosData = [], refetch } = useMunicipiosApi();
  const { data: estadosData = [] } = useEstadosApi();
  const [data, setData] = useState<Municipio[]>(municipiosData);
  const { createMunicipio, updateMunicipio, removeMunicipio } = useMunicipiosMutations();

  useEffect(() => { setData(municipiosData); }, [municipiosData]);

  const handleAdd = async (item: Partial<Municipio>) => {
    try {
      await createMunicipio({ nombre: item.nombre, id_estados: Number(item.id_estados) });
      await refetch();
    } catch (e) { console.error(e); }
  };

  const handleEdit = async (item: Municipio) => {
    try {
      await updateMunicipio(Number(item.id_municipios), { nombre: item.nombre, id_estados: Number(item.id_estados) });
      await refetch();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeMunicipio(Number(id));
      await refetch();
    } catch (e) { console.error(e); }
  };

  return (
    <CrudTable title="Municipios" data={data} columns={columns(estadosData)} idKey="id_municipios"
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
