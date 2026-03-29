import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import MapPicker from "@/components/MapPicker";

export interface ColumnDef<T> {
  key: keyof T & string;
  label: string;
  type?: "text" | "number" | "select" | "boolean" | "date" | "images";
  options?: { value: string; label: string }[];
  editable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface CrudTableProps<T> {
  title: string;
  data: T[];
  columns: ColumnDef<T>[];
  idKey: keyof T & string;
  onAdd: (item: Partial<T>) => void;
  onEdit: (item: T) => void;
  onDelete: (id: T[keyof T]) => void;
}

export function CrudTable<T extends object>({
  title,
  data,
  columns,
  idKey,
  onAdd,
  onEdit,
  onDelete,
}: CrudTableProps<T>) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<T | null>(null);

  // Helpers for image fields
  const setImageFile = async (colKey: string, index: number, file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFormData((prev) => {
        const next: Record<string, any> = { ...(prev as Record<string, any>) };
        const arr = Array.isArray(next[colKey]) ? (next[colKey] as any[]).slice() : [];
        arr[index] = { ...(arr[index] || {}), file, preview: dataUrl, es_portada: !!(arr[index]?.es_portada) };
        next[colKey] = arr;
        return next;
      });
    } catch (e) {
      console.error('Error leyendo imagen:', e);
    }
  };

  const removeImageAt = (colKey: string, index: number) => {
    setFormData((prev) => {
      const next: Record<string, any> = { ...(prev as Record<string, any>) };
      const arr = Array.isArray(next[colKey]) ? (next[colKey] as any[]).slice() : [];
      arr.splice(index, 1);
      next[colKey] = arr;
      return next;
    });
  };

  const setCoverImage = (colKey: string, index: number) => {
    setFormData((prev) => {
      const next: Record<string, any> = { ...(prev as Record<string, any>) };
      const arr = Array.isArray(next[colKey]) ? (next[colKey] as any[]).slice() : [];
      for (let i = 0; i < arr.length; i++) arr[i].es_portada = i === index;
      next[colKey] = arr;
      return next;
    });
  };

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result ?? ''));
    fr.onerror = (e) => reject(e);
    fr.readAsDataURL(file);
  });

  const formatDate = (raw: any) => {
    if (raw === null || raw === undefined || raw === '') return '';
    try {
      let ms: number | undefined;
      if (typeof raw === 'number') {
        ms = raw;
        if (ms < 1e12) ms = ms * 1000;
      } else if (typeof raw === 'string') {
        const onlyDigits = /^\d+$/.test(raw.trim());
        if (onlyDigits) {
          ms = parseInt(raw, 10);
          if (ms < 1e12) ms = ms * 1000;
        } else {
          const parsed = Date.parse(raw);
          if (!isNaN(parsed)) ms = parsed;
        }
      } else {
        const parsed = Date.parse(String(raw));
        if (!isNaN(parsed)) ms = parsed;
      }
      if (!ms) return String(raw);
      const d = new Date(ms);
      if (isNaN(d.getTime())) return String(raw);
      const date = d.toLocaleDateString('es-ES');
      const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      return `${date} ${time}`;
    } catch (e) {
      return String(raw);
    }
  };

  const editableColumns = columns.filter((c) => c.editable !== false && c.key !== idKey);

  const formFields = editableColumns.map((col) => {
    const colClass = col.key === 'titulo' ? 'col-span-1 md:col-span-2' : (col.type === 'images' ? 'col-span-1 md:col-span-1 self-start' : 'col-span-1');
    const items = (formData[col.key] as any[]) || [];
    return (
      <div key={col.key} className={`${colClass} grid gap-1.5`}>
        <label className="text-sm font-medium text-muted-foreground">{col.label}</label>
        {col.type === 'images' ? (
          <div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, idx) => {
                const it = items[idx];
                return (
                  <label key={idx} className="relative border border-dashed rounded-md p-2 h-28 flex items-center justify-center cursor-pointer overflow-hidden">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setImageFile(col.key, idx, f); }} />
                    {it && (it.preview || it.url) ? (
                      <>
                        <img src={it.preview ?? it.url} alt={`preview-${idx}`} className="w-full h-full object-cover rounded" />
                        <div className="absolute top-1 right-1 flex gap-1">
                          <button type="button" className="bg-black/50 text-white text-xs px-1 rounded" onClick={(ev)=>{ ev.stopPropagation(); setCoverImage(col.key, idx); }}>Portada</button>
                          <button type="button" className="bg-red-600 text-white text-xs px-1 rounded" onClick={(ev)=>{ ev.stopPropagation(); removeImageAt(col.key, idx); }}>Eliminar</button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground">
                        <div className="mb-1">Añadir</div>
                        <div className="text-xs">PNG, JPG</div>
                      </div>
                    )}
                    {it && it.es_portada && (
                      <div className="absolute left-1 bottom-1 bg-teal-600 text-white text-xs px-2 py-0.5 rounded">Portada</div>
                    )}
                  </label>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Máx 4 imágenes. Marca una como portada.</div>
          </div>
        ) : col.type === "select" && col.options ? (
          <Select
            value={String(formData[col.key] ?? "")}
            onValueChange={(v: string) => setFormData({ ...formData, [col.key]: v })}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {col.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : col.type === "boolean" ? (
          <Select
            value={String(formData[col.key] ?? "false")}
            onValueChange={(v: string) => setFormData({ ...formData, [col.key]: v === "true" })}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Input
            className="w-full"
            type={col.type === "number" ? "number" : col.type === "date" ? "datetime-local" : "text"}
            value={String(formData[col.key] ?? "")}
            onChange={(e) =>
              setFormData({
                ...formData,
                [col.key]: col.type === "number" ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value,
              })
            }
          />
        )}
      </div>
    );
  });

  const filtered = data.filter((row) =>
    columns.some((col) => {
      const val = (row as Record<string, unknown>)[col.key];
      return val?.toString().toLowerCase().includes(search.toLowerCase());
    })
  );

  const openCreate = () => {
    setEditingItem(null);
    const defaults: Record<string, unknown> = {};
    editableColumns.forEach((col) => {
      if (col.type === "number") defaults[col.key] = '';
      else if (col.type === "boolean") defaults[col.key] = false;
      else if (col.type === "images") defaults[col.key] = [];
      else defaults[col.key] = "";
    });
    setFormData(defaults);
    setDialogOpen(true);
  };

  const hasMapFields = editableColumns.some((c) => c.key === "latitud") && editableColumns.some((c) => c.key === "longitud");

  const openEdit = (item: T) => {
    setEditingItem(item);
    const vals: Record<string, unknown> = {};
    editableColumns.forEach((col) => {
      const raw = (item as Record<string, unknown>)[col.key];
      if (col.type === 'images') {
        // normalize existing detallePublicaciones into array of { url, es_portada }
        const arr = Array.isArray(raw) ? raw as any[] : [];
        vals[col.key] = arr.map((d) => ({ url: d?.url_foto ?? d?.url ?? d, es_portada: d?.es_portada ?? false }));
      } else {
        vals[col.key] = raw;
      }
    });
    setFormData(vals);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload: Record<string, any> = { ...formData } as Record<string, any>;

      // handle image uploads for any image columns
      const UPLOAD_URL = (import.meta.env.VITE_UPLOAD_URL as string) ?? '';
      for (const col of editableColumns) {
        if (col.type === 'images') {
          const items = (formData[col.key] as any[]) || [];
          const urls: { url: string; es_portada: boolean }[] = [];
          for (let i = 0; i < items.length; i++) {
            const it = items[i];
            if (!it) continue;
            if (it.file instanceof File) {
              if (UPLOAD_URL) {
                const fd = new FormData();
                fd.append('file', it.file as File);
                const resp = await fetch(UPLOAD_URL, { method: 'POST', body: fd });
                if (!resp.ok) throw new Error('Error subiendo imagen: ' + resp.statusText);
                const json = await resp.json();
                const url = json.url ?? json.data?.url;
                if (!url) throw new Error('Respuesta de upload sin URL');
                urls.push({ url, es_portada: !!it.es_portada });
              } else {
                // Prefer converting the actual File to base64 instead of using an object URL preview.
                const dataUrl = await readFileAsDataUrl(it.file as File);
                urls.push({ url: dataUrl, es_portada: !!it.es_portada });
              }
            } else if (it.url) {
              urls.push({ url: it.url, es_portada: !!it.es_portada });
            }
          }
          // ensure at least one portada
          if (urls.length > 0 && !urls.some(u => u.es_portada)) urls[0].es_portada = true;
          payload[col.key] = urls.map(u => ({ url_foto: u.url, es_portada: u.es_portada }));
        }
      }

      if (editingItem) {
        const res = onEdit({ ...editingItem, ...payload } as T);
        if (res && typeof (res as any).then === 'function') await res;
        toast.success('Registro actualizado');
      } else {
        const res = onAdd(payload as Partial<T>);
        if (res && typeof (res as any).then === 'function') await res;
        toast.success('Registro creado');
      }
      setDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error('Error al guardar: ' + (err?.message ?? String(err)));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const rawId = (deleteConfirm as Record<string, unknown>)[idKey];
      const idNum = typeof rawId === 'number' ? rawId : Number(rawId);
      if (!Number.isFinite(idNum)) {
        toast.error('ID inválido para eliminar');
        return;
      }
      const res = onDelete(idNum as unknown as T[keyof T]);
      if (res && typeof (res as any).then === 'function') await res;
      toast.success('Registro eliminado');
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error al eliminar registro:', err);
      toast.error('Error al eliminar: ' + (err?.message ?? String(err)));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nuevo
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                {columns.map((col) => (
                  <TableHead key={col.key} className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold w-24">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                    No se encontraron registros
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row, i) => (
                  <TableRow key={String((row as Record<string, unknown>)[idKey] ?? i)} className="hover:bg-secondary/30 transition-colors">
                    {columns.map((col) => {
                      const val = (row as Record<string, unknown>)[col.key];
                      return (
                        <TableCell key={col.key} className="text-sm">
                          {col.render
                            ? col.render(val as T[keyof T], row)
                            : col.type === "boolean"
                            ? (val ? "✅" : "❌")
                            : col.type === "date"
                            ? formatDate(val)
                            : String(val ?? "")}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(row)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(row)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        {filtered.length} de {data.length} registros
      </p>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl w-full max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Registro" : "Nuevo Registro"}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="overflow-y-auto max-h-[68vh] pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {hasMapFields && (
                    <div className="col-span-1 md:col-span-2">
                      <MapPicker
                        lat={formData["latitud"] === '' || formData["latitud"] === undefined || formData["latitud"] === null ? undefined : Number(formData["latitud"])}
                        lng={formData["longitud"] === '' || formData["longitud"] === undefined || formData["longitud"] === null ? undefined : Number(formData["longitud"])}
                        onChange={(lat, lng) => setFormData({ ...formData, latitud: lat, longitud: lng })}
                      />
                    </div>
                  )}

                {formFields}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar registro?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
