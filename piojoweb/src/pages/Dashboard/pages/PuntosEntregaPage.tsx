import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { PuntoEntrega, Municipio } from "../lib/mock-data";
import usePuntosEntregaApi from "../hooks/usePuntosEntregaApi";
import usePuntosEntregaMutations from "../hooks/usePuntosEntregaMutations";
import useMunicipiosApi from "../hooks/useMunicipiosApi";

export default function PuntosEntregaPage() {
  const { data: puntosData = [], refetch } = usePuntosEntregaApi();
  const { data: municipiosData = [] } = useMunicipiosApi();
  const [data, setData] = useState<PuntoEntrega[]>(puntosData);
  useEffect(() => { setData(puntosData); }, [puntosData]);
  const { createPuntoEntrega, updatePuntoEntrega, removePuntoEntrega } = usePuntosEntregaMutations();

  

  const columns: ColumnDef<PuntoEntrega>[] = [
    { key: "id_puntos_entrega", label: "ID", editable: false },
    { key: "nombre", label: "Nombre" },
    { key: "id_municipios", label: "Municipio", type: "select", options: municipiosData.map((m: Municipio) => ({ value: String(m.id_municipios), label: m.nombre })) },
    { key: "latitud", label: "Latitud", type: "number" },
    { key: "longitud", label: "Longitud", type: "number" },
    { key: "descripcion", label: "Descripción" },
  ];

  return (
    <CrudTable title="Puntos de Entrega" data={data} columns={columns} idKey="id_puntos_entrega"
      onAdd={async (item) => {
        const payload = {
          nombre: String(item.nombre ?? ""),
          id_municipios: Number(item.id_municipios ?? 0),
          latitud: Number(item.latitud ?? 0),
          longitud: Number(item.longitud ?? 0),
          descripcion: String(item.descripcion ?? ""),
        };
        try {
          await createPuntoEntrega(payload);
          await refetch();
        } catch (err) { console.error(err); }
      }}
      onEdit={async (item) => {
        const id = Number((item as any).id_puntos_entrega ?? 0);
        const payload = {
          nombre: String(item.nombre ?? ""),
          id_municipios: Number(item.id_municipios ?? 0),
          latitud: Number(item.latitud ?? 0),
          longitud: Number(item.longitud ?? 0),
          descripcion: String(item.descripcion ?? ""),
        };
        try {
          await updatePuntoEntrega(id, payload);
          await refetch();
        } catch (err) { console.error(err); }
      }}
      onDelete={async (id) => {
        try {
          await removePuntoEntrega(Number(id));
          await refetch();
        } catch (err) { console.error(err); }
      }}
    />
  );
}
