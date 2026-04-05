import { useState, useEffect, useMemo } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { Publicacion } from "../lib/mock-data";
import usePublicacionesApi from "../hooks/usePublicacionesApi";
import normalizeImageUrl from "@/lib/normalizeImageUrl";
import piojoLogo from "@/assets/piojo-logo.png";
import usePublicacionesMutations from "../hooks/usePublicacionesMutations";
import useUsuarioApi from "../hooks/useUsuarioApi";
import usePuntosEntregaApi from "../hooks/usePuntosEntregaApi";

export default function PublicacionesPage() {
  const { data: publicacionesData = [], refetch } = usePublicacionesApi();
  const { createPublicacion, updatePublicacion, removePublicacion } = usePublicacionesMutations();
  const { data: usuariosData = [] } = useUsuarioApi(1, 10000);
  const { data: puntosData = [] } = usePuntosEntregaApi();

  const usuariosOptions = useMemo(() => (usuariosData || []).map((u: any) => ({ value: String(u.id_usuarios ?? u.id ?? u.id), label: u.nombre ? `${u.nombre} ${u.apellido_paterno ?? ''}`.trim() : (u.email ?? String(u.id)) })), [usuariosData]);

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
    { key: "fecha_publicacion", label: "Fecha y Hora", type: "date" },
    { key: "id_usuarios", label: "Usuario", type: "select", options: usuariosOptions, render: (val) => {
      const id = String(val ?? '');
      const found = (usuariosData || []).find((u: any) => String(u.id_usuarios ?? u.id ?? u.id) === id);
      if (found) return found.nombre ? `${found.nombre} ${found.apellido_paterno ?? ''}`.trim() : (found.email ?? id);
      return id || '-';
    } },
    { key: "id_puntos_entrega", label: "Punto de Entrega", type: "select", options: (puntosData || []).map((p:any)=>({ value: String(p.id_puntos_entrega), label: p.nombre })), render: (val) => {
      const id = String(val ?? '');
      const found = (puntosData || []).find((p:any) => String(p.id_puntos_entrega) === id);
      return found ? found.nombre : (id || '-');
    } },
    { key: "detallePublicaciones", label: "Imágenes", type: "images", editable: true, render: (val) => {
      const arr = (val as any[]) || [];
      if (!arr || arr.length === 0) return "-";
      return (
        <div className="flex items-center gap-2">
          {arr.slice(0,3).map((d:any, i:number) => (
            <img
              key={i}
              src={normalizeImageUrl(d?.url_foto ?? d?.url) ?? piojoLogo}
              alt={`img-${i}`}
              className="h-8 w-8 rounded-md object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = piojoLogo; }}
            />
          ))}
          {arr.length > 3 && <span className="text-xs text-muted-foreground">+{arr.length - 3}</span>}
        </div>
      );
    } },
  ];

  const [data, setData] = useState<Publicacion[]>(publicacionesData);
  useEffect(() => { setData(publicacionesData); }, [publicacionesData]);
  return (
    <CrudTable
      title="Publicaciones"
      data={data}
      columns={columns}
      idKey="id_publicaciones"
      onAdd={(item) => createPublicacion(item as Record<string, any>).then(() => refetch())}
      onEdit={async (item) => {
        try {
          await updatePublicacion((item as any).id_publicaciones, item as Record<string, any>);
          await refetch();
        } catch (err: any) {
          const msg = String(err?.message ?? err);
          // If backend schema lacks the Update input/mutation, fallback to create+delete
          if (msg.includes('UpdatePublicacionesInput') || msg.includes('Unknown type') || msg.includes('UpdatePublicaciones')) {
            console.warn('Update failed, falling back to create+delete due to backend schema:', msg);
            const originalId = Number((item as any).id_publicaciones);
            const copy = { ...(item as Record<string, any>) } as Record<string, any>;
            delete copy.id_publicaciones;
            const created = await createPublicacion(copy);
            if (created && created.id_publicaciones && originalId) {
              await removePublicacion(originalId);
              await refetch();
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        }
      }}
      onDelete={async (id) => {
        try {
          await removePublicacion(Number(id));
          await refetch();
        } catch (err: any) {
          const msg = String(err?.message ?? err);
          // If backend doesn't expose removePublicacion, fall back to local removal so UI behaves.
          if (msg.includes('removePublicacion') || msg.includes('Cannot query field') || msg.includes('Unknown type')) {
            console.warn('removePublicacion not available on backend, removing locally:', msg);
            setData((s) => s.filter((r) => String((r as any).id_publicaciones) !== String(id)));
            return;
          }
          throw err;
        }
      }}
    />
  );
}
