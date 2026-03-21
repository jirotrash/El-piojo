import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { Rol } from "../lib/mock-data";
import useRolesApi from "../hooks/useRolesApi";

const columns: ColumnDef<Rol>[] = [
  { key: "id_roles", label: "ID", editable: false },
  { key: "nombre", label: "Nombre" },
];

export default function RolesPage() {
  const { data: rolesData = [] } = useRolesApi();
  const [data, setData] = useState<Rol[]>(rolesData);
  useEffect(() => { setData(rolesData); }, [rolesData]);
  return (
    <CrudTable title="Roles" data={data} columns={columns} idKey="id_roles"
      onAdd={(item) => setData([...data, { ...item, id_roles: data.length + 1 } as Rol])}
      onEdit={(item) => setData(data.map(d => d.id_roles === item.id_roles ? item : d))}
      onDelete={(id) => setData(data.filter(d => d.id_roles !== id))}
    />
  );
}
