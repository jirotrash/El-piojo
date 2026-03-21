import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { DetalleMensaje } from "../lib/mock-data";
import useDetalleMensajesApi from "../hooks/useDetalleMensajesApi";
import useConversacionesApi from "../hooks/useConversacionesApi";
import useUsuarioApi from "../hooks/useUsuarioApi";

export default function MensajesPage() {
  const { data: mensajesData = [] } = useDetalleMensajesApi();
  const { data: conversacionesData = [] } = useConversacionesApi();
  const { data: usuariosData = [] } = useUsuarioApi();

  const [data, setData] = useState<DetalleMensaje[]>(mensajesData);
  useEffect(() => { setData(mensajesData); }, [mensajesData]);

  const conversacionOptions = conversacionesData.map(c => ({ value: String((c as any).id_conversaciones ?? (c as any).id), label: `Conv #${(c as any).id_conversaciones ?? (c as any).id}` }));
  const usuarioOptions = usuariosData.map(u => ({ value: String((u as any).id_usuarios ?? (u as any).id), label: `${(u as any).nombre ?? ''} ${(u as any).apellido_paterno ?? ''}` }));

  const columns: ColumnDef<DetalleMensaje>[] = [
    { key: "id_detalle_mensajes", label: "ID", editable: false },
    { key: "id_conversaciones", label: "Conversación", type: "select", options: conversacionOptions },
    { key: "id_emisor", label: "Emisor", type: "select", options: usuarioOptions },
    { key: "mensaje", label: "Mensaje" },
    { key: "fecha_envio", label: "Fecha Envío" },
  ];

  return (
    <CrudTable title="Mensajes" data={data} columns={columns} idKey="id_detalle_mensajes"
      onAdd={(item) => setData([...data, { ...item, id_detalle_mensajes: data.length + 1 } as DetalleMensaje])}
      onEdit={(item) => setData(data.map(d => d.id_detalle_mensajes === item.id_detalle_mensajes ? item : d))}
      onDelete={(id) => setData(data.filter(d => d.id_detalle_mensajes !== id))}
    />
  );
}
