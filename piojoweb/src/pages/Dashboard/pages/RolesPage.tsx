import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { Rol } from "../lib/mock-data";
import useRolesApi from "../hooks/useRolesApi";
import useRolesMutations from "../hooks/useRolesMutations";

const columns: ColumnDef<Rol>[] = [
  { key: "id_roles", label: "ID", editable: false },
  { key: "nombre", label: "Nombre" },
];

export default function RolesPage() {
  const { data: rolesData = [], refetch } = useRolesApi();
  const { createRole, updateRole, removeRole } = useRolesMutations();
  const [data, setData] = useState<Rol[]>(rolesData);
  useEffect(() => { setData(rolesData); }, [rolesData]);

  return (
    <CrudTable title="Roles" data={data} columns={columns} idKey="id_roles"
      onAdd={(item) => {
        // Persist to backend then refetch
        createRole(item as Record<string, any>).then(() => refetch()).catch(() => {});
      }}
      onEdit={(item) => {
        updateRole((item as any).id_roles, item as Record<string, any>).then(() => refetch()).catch(() => {});
      }}
      onDelete={(id) => {
        removeRole(Number(id)).then(() => refetch()).catch(() => {});
      }}
    />
  );
}
