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
  type?: "text" | "number" | "select" | "boolean" | "date";
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

  const editableColumns = columns.filter((c) => c.editable !== false && c.key !== idKey);

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
      if (col.type === "number") defaults[col.key] = 0;
      else if (col.type === "boolean") defaults[col.key] = false;
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
      vals[col.key] = (item as Record<string, unknown>)[col.key];
    });
    setFormData(vals);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      onEdit({ ...editingItem, ...formData } as T);
      toast.success("Registro actualizado");
    } else {
      onAdd(formData as Partial<T>);
      toast.success("Registro creado");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      onDelete((deleteConfirm as Record<string, unknown>)[idKey] as T[keyof T]);
      toast.success("Registro eliminado");
      setDeleteConfirm(null);
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Registro" : "Nuevo Registro"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto">
            {hasMapFields && (
              <MapPicker
                lat={Number(formData["latitud"] ?? 0)}
                lng={Number(formData["longitud"] ?? 0)}
                onChange={(lat, lng) => setFormData({ ...formData, latitud: lat, longitud: lng })}
              />
            )}
            {editableColumns.map((col) => (
              <div key={col.key} className="grid gap-1.5">
                <label className="text-sm font-medium text-muted-foreground">{col.label}</label>
                {col.type === "select" && col.options ? (
                  <Select
                    value={String(formData[col.key] ?? "")}
                    onValueChange={(v: string) => setFormData({ ...formData, [col.key]: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sí</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                    value={String(formData[col.key] ?? "")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [col.key]: col.type === "number" ? Number(e.target.value) : e.target.value,
                      })
                    }
                  />
                )}
              </div>
            ))}
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
