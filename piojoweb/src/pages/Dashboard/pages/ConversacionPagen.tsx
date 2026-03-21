import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { Conversacion } from "../lib/mock-data";
import useConversacionesApi from "../hooks/useConversacionesApi";
import usePublicacionesApi from "../hooks/usePublicacionesApi";
import useUsuarioApi from "../hooks/useUsuarioApi";

export default function ConversacionesPage() {
  const { data: conversacionesData = [] } = useConversacionesApi();
  const { data: publicacionesData = [] } = usePublicacionesApi();
  const { data: usuariosData = [] } = useUsuarioApi();

  const [data, setData] = useState<Conversacion[]>(conversacionesData);
  useEffect(() => { setData(conversacionesData); }, [conversacionesData]);

  const publicacionOptions = publicacionesData.map(p => ({ value: String((p as any).id_publicaciones ?? (p as any).id), label: (p as any).titulo ?? '' }));
  const usuarioOptions = usuariosData.map(u => ({ value: String((u as any).id_usuarios ?? (u as any).id), label: `${(u as any).nombre ?? ''} ${(u as any).apellido_paterno ?? ''}` }));

  const columns: ColumnDef<Conversacion>[] = [
    { key: "id_conversaciones", label: "ID", editable: false },
    { key: "id_publicaciones", label: "Publicación", type: "select", options: publicacionOptions },
    { key: "id_vendedor", label: "Vendedor", type: "select", options: usuarioOptions },
    { key: "id_comprador", label: "Comprador", type: "select", options: usuarioOptions },
    { key: "fecha_creacion", label: "Fecha", type: "date" },
  ];

  return (
    <CrudTable title="Conversaciones" data={data} columns={columns} idKey="id_conversaciones"
      onAdd={(item) => setData([...data, { ...item, id_conversaciones: data.length + 1 } as Conversacion])}
      onEdit={(item) => setData(data.map(d => d.id_conversaciones === item.id_conversaciones ? item : d))}
      onDelete={(id) => setData(data.filter(d => d.id_conversaciones !== id))}
    />
  );
}
