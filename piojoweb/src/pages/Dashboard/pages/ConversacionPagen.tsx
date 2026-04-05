import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { Conversacion } from "../lib/mock-data";
import useConversacionesApi from "../hooks/useConversacionesApi";
import usePublicacionesApi from "../hooks/usePublicacionesApi";
import useUsuarioApi from "../hooks/useUsuarioApi";
import useConversacionesMutations from "../hooks/useConversacionesMutations";

export default function ConversacionesPage() {
  const { data: conversacionesData = [], refetch } = useConversacionesApi();
  const { data: publicacionesData = [] } = usePublicacionesApi();
  const { data: usuariosData = [] } = useUsuarioApi();
  const { createConversacion, updateConversacion, removeConversacion } = useConversacionesMutations();

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
      onAdd={async (item) => {
        try {
          await createConversacion(item as Record<string, any>);
          await refetch();
        } catch (err) { console.error(err); }
      }}
      onEdit={async (item) => {
        try {
          await updateConversacion(Number((item as any).id_conversaciones), item as Record<string, any>);
          await refetch();
        } catch (err) { console.error(err); }
      }}
      onDelete={async (id) => {
        try {
          await removeConversacion(Number(id));
          await refetch();
        } catch (err) { console.error(err); }
      }}
    />
  );
}
