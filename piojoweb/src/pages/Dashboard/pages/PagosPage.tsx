import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { Pago } from "../lib/mock-data";
import usePagosApi from "../hooks/usePagosApi";
import useUsuarioApi from "../hooks/useUsuarioApi";

export default function PagosPage() {
  const { data: pagosData = [] } = usePagosApi();
  const { data: usuariosData = [] } = useUsuarioApi();
  const [data, setData] = useState<Pago[]>(pagosData);
  useEffect(() => { setData(pagosData); }, [pagosData]);
  // Build options for pagador if payments include an user id field
  const usuarioOptions = usuariosData.map(u => ({ value: String((u as any).id_usuarios ?? (u as any).id), label: `${(u as any).nombre ?? ''} ${((u as any).apellido_paterno ?? '')}` }));

  const columns: ColumnDef<Pago>[] = [
    { key: "id_pagos", label: "ID", editable: false },
    { key: "id_usuarios_pagador", label: "Pagador", type: "select", options: usuarioOptions },
    { key: "total", label: "Total", type: "number" },
    { key: "total_con_descuento", label: "Con Descuento", type: "number" },
    { key: "metodo_pago", label: "Método", type: "select", options: [{ value: "Efectivo", label: "Efectivo" }, { value: "Transferencia", label: "Transferencia" }, { value: "Tarjeta", label: "Tarjeta" }] },
    { key: "estado", label: "Estado", type: "select", options: [{ value: "Pendiente", label: "Pendiente" }, { value: "Completado", label: "Completado" }, { value: "Cancelado", label: "Cancelado" }] },
    { key: "fecha_pago", label: "Fecha", type: "date" },
  ];

  return (
    <CrudTable title="Pagos" data={data} columns={columns} idKey="id_pagos"
      onAdd={(item) => setData([...data, { ...item, id_pagos: data.length + 1 } as Pago])}
      onEdit={(item) => setData(data.map(d => d.id_pagos === item.id_pagos ? item : d))}
      onDelete={(id) => setData(data.filter(d => d.id_pagos !== id))}
    />
  );
}
