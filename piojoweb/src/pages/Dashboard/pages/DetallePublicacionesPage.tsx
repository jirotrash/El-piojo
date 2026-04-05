import { useEffect, useState } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { DetallePublicacion } from "../lib/mock-data";
import useDetallePublicacionesApi from "../hooks/useDetallePublicacionesApi";
import normalizeImageUrl from "@/lib/normalizeImageUrl";
import piojoLogo from "@/assets/piojo-logo.png";
import useDetallePublicacionesMutations from "../hooks/useDetallePublicacionesMutations";
import usePublicacionesApi from "../hooks/usePublicacionesApi";

export default function DetallePublicacionesPage() {
  const { data: detalles = [], refetch } = useDetallePublicacionesApi();
  const { data: publicaciones = [] } = usePublicacionesApi();
  const { createDetalle, updateDetalle, removeDetalle } = useDetallePublicacionesMutations();

  const [data, setData] = useState<DetallePublicacion[]>(detalles);
  useEffect(() => { setData(detalles); }, [detalles]);

  const columns: ColumnDef<DetallePublicacion>[] = [
    { key: "id_detalle_publicaciones", label: "ID", editable: false },
    { key: "id_publicaciones", label: "Publicación", type: "select", options: (publicaciones || []).map((p: any) => ({ value: String(p.id_publicaciones), label: p.titulo })) },
    {
      key: "url_foto",
      label: "Imagen",
      render: (val) => {
        const url = String(val ?? '');
        if (!url) return '-';
        const norm = normalizeImageUrl(url) ?? url;
        return (
          <div className="flex items-center gap-2">
            <a href={norm} target="_blank" rel="noreferrer">
              <img src={norm ?? piojoLogo} alt="foto" className="h-10 w-10 object-cover rounded-md border" onError={(e) => { (e.currentTarget as HTMLImageElement).src = piojoLogo; }} />
            </a>
          </div>
        );
      },
    },
    { key: "es_portada", label: "Es Portada", type: "boolean" },
  ];

  return (
    <CrudTable title="Fotos de Publicaciones" data={data} columns={columns} idKey="id_detalle_publicaciones"
      onAdd={async (item) => {
        const payload = {
          id_publicaciones: item.id_publicaciones ? Number(item.id_publicaciones) : undefined,
          url_foto: String(item.url_foto ?? ''),
          es_portada: !!item.es_portada,
        };
        await createDetalle(payload);
        await refetch();
      }}
      onEdit={async (item) => {
        const id = Number((item as any).id_detalle_publicaciones);
        const payload = {
          id_publicaciones: item.id_publicaciones ? Number(item.id_publicaciones) : undefined,
          url_foto: String(item.url_foto ?? ''),
          es_portada: !!item.es_portada,
        };
        await updateDetalle(id, payload);
        await refetch();
      }}
      onDelete={async (id) => {
        await removeDetalle(Number(id));
        await refetch();
      }}
    />
  );
}
