import { useState, useEffect, useRef } from "react";
import { CrudTable } from "../components/CrudTable";
import type { ColumnDef } from "../components/CrudTable";
import type { Usuario, Rol, Carrera, Municipio } from "../lib/mock-data";
import useUsuarioInfinite from "../hooks/useUsuarioInfinite";
import useRolesApi from "../hooks/useRolesApi";
import useCarrerasApi from "../hooks/useCarrerasApi";
import useMunicipiosApi from "../hooks/useMunicipiosApi";
import useUsuarioMutations from "../hooks/useUsuarioMutations";
import { toast } from "@/hooks/use-toast";

const columns = (roles: Rol[], carreras: Carrera[], municipios: Municipio[]): ColumnDef<Usuario>[] => [
	{ key: "id_usuarios", label: "ID", editable: false },
	{
		key: "foto_perfil",
		label: "Avatar",
		editable: false,
		render: (val, row) => (
			<div className="flex items-center">
				{val ? (
					<img src={String(val)} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
				) : (
					<div className="h-8 w-8 rounded-full bg-slate-600 text-xs flex items-center justify-center text-white">
						{(row?.nombre || "").toString().charAt(0).toUpperCase()}
					</div>
				)}
			</div>
		),
	},
	{ key: "id_roles", label: "Rol", type: "select", options: roles.map(r => ({ value: String(r.id_roles), label: r.nombre })), render: (val) => {
			const id = Number(val);
			return roles.find(r => r.id_roles === id)?.nombre ?? '';
		} },
	{ key: "id_carreras", label: "Carrera", type: "select", options: carreras.map(c => ({ value: String(c.id_carreras), label: `${c.nombre} — ${c.universidad}` })), render: (val) => {
			const id = Number(val);
			return carreras.find(c => c.id_carreras === id)?.nombre ?? '';
		} },
	{ key: "id_municipios", label: "Municipio", type: "select", options: municipios.map(m => ({ value: String(m.id_municipios), label: m.nombre })), render: (val) => {
			const id = Number(val);
			return municipios.find(m => m.id_municipios === id)?.nombre ?? '';
		} },
	{ key: "nombre", label: "Nombre", render: (val, row) => (
		<div>
			<div className="font-medium">{val}</div>
			<div className="text-xs text-muted-foreground">{(row as any).email}</div>
		</div>
	) },
	{ key: "apellido_paterno", label: "Apellido paterno" },
	{ key: "apellido_materno", label: "Apellido materno" },
	{ key: "email", label: "Email" },
	{ key: "password", label: "Contraseña", render: () => '••••••' },
	{ key: "telefono", label: "Teléfono" },
	{ key: "matricula", label: "Matrícula" },
	{ key: "fecha_registro", label: "Fecha registro", type: "date", render: (val) => {
			const n = Number(val);
			if (!n || Number.isNaN(n)) return String(val ?? '');
			return new Date(n).toLocaleString();
		} },
];

export default function UsuariosPage() {
	const limit = 10;
	const { data: usuariosData = [], loading, loadingMore, hasMore, loadMore, refresh } = useUsuarioInfinite(limit);
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const el = sentinelRef.current;
		if (!el) return;
		const obs = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && hasMore) {
					loadMore();
				}
			});
		}, { root: null, rootMargin: '200px' });
		obs.observe(el);
		return () => obs.disconnect();
	}, [loadMore, hasMore]);
	const { data: rolesData = [] } = useRolesApi();
	const { data: carrerasData = [] } = useCarrerasApi();
	const { data: municipiosData = [] } = useMunicipiosApi();
	const { createUsuario, updateUsuario, removeUsuario } = useUsuarioMutations();

	return (
		<div>
			<CrudTable title="Usuarios" data={usuariosData} columns={columns(rolesData, carrerasData, municipiosData)} idKey="id_usuarios"
				onAdd={async (item) => {
					try {
						await createUsuario(item as any);
						await refresh();
						toast({ title: 'Usuario creado', description: 'Se guardó el usuario en el servidor.' });
					} catch (err: any) {
						toast({ title: 'Error', description: err?.message ?? 'No se pudo crear usuario' });
					}
				}}
				onEdit={async (item) => {
					try {
						await updateUsuario((item as any).id_usuarios, item as any);
						await refresh();
						toast({ title: 'Usuario actualizado' });
					} catch (err: any) {
						toast({ title: 'Error', description: err?.message ?? 'No se pudo actualizar' });
					}
				}}
				onDelete={async (id) => {
					try {
						const ok = await removeUsuario(id as number);
						if (ok) {
							await refresh();
							toast({ title: 'Usuario eliminado' });
						} else {
							toast({ title: 'Error', description: 'El servidor no confirmó la eliminación.' });
						}
					} catch (err: any) {
						toast({ title: 'Error', description: err?.message ?? 'No se pudo eliminar' });
					}
				}}
			/>

			<div className="mt-3">
				{loading && <div className="text-center py-2">Cargando...</div>}
				<div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
				{loadingMore && <div className="text-center py-2">Cargando más...</div>}
				{!hasMore && <div className="text-center py-2 text-muted-foreground">No hay más registros</div>}
			</div>
		</div>
	);
}

