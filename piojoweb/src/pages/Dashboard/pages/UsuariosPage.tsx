import { useState, useEffect } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { Usuario, Rol, Carrera, Municipio } from "../lib/mock-data";
import useUsuarioApi from "../hooks/useUsuarioApi";
import useRolesApi from "../hooks/useRolesApi";
import useCarrerasApi from "../hooks/useCarrerasApi";
import useMunicipiosApi from "../hooks/useMunicipiosApi";
import useUsuarioMutations from "../hooks/useUsuarioMutations";
import { toast } from "@/hooks/use-toast";

const columns = (roles: Rol[], carreras: Carrera[], municipios: Municipio[]): ColumnDef<Usuario>[] => [
	{ key: "id_usuarios", label: "ID", editable: false },
	{ key: "id_roles", label: "Rol", type: "select", options: roles.map(r => ({ value: String(r.id_roles), label: r.nombre })) },
	{ key: "id_carreras", label: "Carrera", type: "select", options: carreras.map(c => ({ value: String(c.id_carreras), label: `${c.nombre} — ${c.universidad}` })) },
	{ key: "id_municipios", label: "Municipio", type: "select", options: municipios.map(m => ({ value: String(m.id_municipios), label: m.nombre })) },
	{ key: "nombre", label: "Nombre" },
	{ key: "apellido_paterno", label: "Apellido paterno" },
	{ key: "apellido_materno", label: "Apellido materno" },
	{ key: "email", label: "Email" },
	{ key: "telefono", label: "Teléfono" },
	{ key: "matricula", label: "Matrícula" },
	{ key: "fecha_registro", label: "Fecha registro", type: "date" },
];

export default function UsuariosPage() {
	const { data: usuariosData = [] } = useUsuarioApi();
	const { data: rolesData = [] } = useRolesApi();
	const { data: carrerasData = [] } = useCarrerasApi();
	const { data: municipiosData = [] } = useMunicipiosApi();
	const { createUsuario, updateUsuario, removeUsuario } = useUsuarioMutations();

	const [data, setData] = useState<Usuario[]>(usuariosData);
	useEffect(() => { setData(usuariosData); }, [usuariosData]);

	return (
		<CrudTable title="Usuarios" data={data} columns={columns(rolesData, carrerasData, municipiosData)} idKey="id_usuarios"
			onAdd={async (item) => {
				try {
					const created = await createUsuario(item as any);
					setData([...data, created as Usuario]);
					toast({ title: 'Usuario creado', description: 'Se guardó el usuario en el servidor.' });
				} catch (err: any) {
					toast({ title: 'Error', description: err?.message ?? 'No se pudo crear usuario' });
				}
			}}
			onEdit={async (item) => {
				try {
					const updated = await updateUsuario((item as any).id_usuarios, item as any);
					setData(data.map(d => d.id_usuarios === (updated as any).id_usuarios ? (updated as Usuario) : d));
					toast({ title: 'Usuario actualizado' });
				} catch (err: any) {
					toast({ title: 'Error', description: err?.message ?? 'No se pudo actualizar' });
				}
			}}
			onDelete={async (id) => {
				try {
					const ok = await removeUsuario(id as number);
					if (ok) {
						setData(data.filter(d => d.id_usuarios !== id));
						toast({ title: 'Usuario eliminado' });
					} else {
						toast({ title: 'Error', description: 'El servidor no confirmó la eliminación.' });
					}
				} catch (err: any) {
					toast({ title: 'Error', description: err?.message ?? 'No se pudo eliminar' });
				}
			}}
		/>
	);
}

