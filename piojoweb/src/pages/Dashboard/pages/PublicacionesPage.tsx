import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { Publicacion } from "../lib/mock-data";
import usePublicacionesApi from "../hooks/usePublicacionesApi";

const columns: ColumnDef<Publicacion>[] = [
  { key: "id_publicaciones", label: "ID", editable: false },
  { key: "titulo", label: "Título" },
  { key: "categoria", label: "Categoría" },
  { key: "marca", label: "Marca" },
  { key: "talla", label: "Talla" },
  { key: "color", label: "Color" },
  { key: "genero", label: "Género", type: "select", options: [{ value: "Hombre", label: "Hombre" }, { value: "Mujer", label: "Mujer" }, { value: "Unisex", label: "Unisex" }] },
  { key: "estado_uso", label: "Estado", type: "select", options: [{ value: "Nuevo", label: "Nuevo" }, { value: "Seminuevo", label: "Seminuevo" }, { value: "Usado", label: "Usado" }] },
  { key: "precio", label: "Precio", type: "number" },
  { key: "disponible", label: "Disponible", type: "boolean" },
  { key: "fecha_publicacion", label: "Fecha", type: "date" },
];

export default function PublicacionesPage() {
  const { data: publicacionesData = [] } = usePublicacionesApi();
  const [data, setData] = useState<Publicacion[]>(publicacionesData);
  useEffect(() => { setData(publicacionesData); }, [publicacionesData]);
  return (
    <CrudTable title="Publicaciones" data={data} columns={columns} idKey="id_publicaciones"
      onAdd={(item) => setData([...data, { ...item, id_publicaciones: data.length + 1 } as Publicacion])}
      onEdit={(item) => setData(data.map(d => d.id_publicaciones === item.id_publicaciones ? item : d))}
      onDelete={(id) => setData(data.filter(d => d.id_publicaciones !== id))}
    />
  );
}
