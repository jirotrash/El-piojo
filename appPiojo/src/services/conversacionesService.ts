import { graphqlRequest } from '../api/api';
import { GET_CONVERSACIONES_QUERY } from '../api/queries';

interface GQLConversacion {
  id_conversaciones: number;
  fecha_creacion: string;
  publicacion: {
    id_publicaciones: number;
    titulo: string;
    precio: number;
    disponible: boolean;
  } | null;
  comprador: { id_usuarios: number } | null;
}

export interface Compra {
  id: string;
  nombre: string;
  precio: number;
  fecha: string;
  estado: 'Entregado' | 'En proceso';
}

function formatDateShort(raw: string): string {
  const d = new Date(raw.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Devuelve las conversaciones donde el usuario es comprador (sus compras) */
export async function getMisCompras(userId: string): Promise<Compra[]> {
  const data = await graphqlRequest<{ conversaciones: GQLConversacion[] }>(
    GET_CONVERSACIONES_QUERY,
  );
  return (data.conversaciones ?? [])
    .filter((c) => c.comprador && String(c.comprador.id_usuarios) === userId && c.publicacion)
    .map((c) => ({
      id:     String(c.id_conversaciones),
      nombre: c.publicacion!.titulo,
      precio: c.publicacion!.precio,
      fecha:  formatDateShort(c.fecha_creacion),
      estado: c.publicacion!.disponible === false ? 'Entregado' : 'En proceso',
    }));
}
