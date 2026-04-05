import { graphqlRequest } from '../api/api';
import { GET_PUBLICACIONES_QUERY, CREATE_PUBLICACION_MUTATION, GET_PUNTOS_ENTREGA_QUERY } from '../api/queries';
import { Product, ProductCategory } from '../interfaces';

const CONDITION_TO_BACKEND: Record<string, string> = {
  excelente: 'NUEVO',
  bueno:     'BUENO',
  regular:   'USADO',
};

export interface CreatePublicacionInput {
  id_usuarios: number;
  titulo: string;
  descripcion?: string;
  categoria: string;
  talla?: string;
  marca?: string;
  color?: string;
  genero?: string;
  estado_uso: string;
  precio: number;
  disponible?: boolean;
  id_puntos_entrega?: number;
  detallePublicaciones?: { url_foto: string; es_portada: boolean }[];
}

/** Crea una publicación en el backend. Devuelve el id generado. */
export async function createPublicacion(input: {
  userId: string;
  titulo: string;
  categoria: string;
  talla?: string;
  marca?: string;
  color?: string;
  descripcion?: string;
  condition: 'excelente' | 'bueno' | 'regular';
  precio: number;
  fotoUrls?: string[];
  idPuntoEntrega?: number;
}): Promise<number> {
  const data = await graphqlRequest<{ createPublicacion: { id_publicaciones: number } }>(
    CREATE_PUBLICACION_MUTATION,
    {
      input: {
        id_usuarios:   parseInt(input.userId),
        titulo:        input.titulo,
        descripcion:   input.descripcion,
        categoria:     input.categoria,
        talla:         input.talla,
        marca:         input.marca,
        color:         input.color,
        genero:        'UNISEX',
        estado_uso:    CONDITION_TO_BACKEND[input.condition] ?? 'BUENO',
        precio:        input.precio,
        disponible:    true,
        id_puntos_entrega: input.idPuntoEntrega,
        detallePublicaciones: (input.fotoUrls ?? []).map((url, i) => ({
          url_foto: url,
          es_portada: i === 0,
        })),
      } satisfies CreatePublicacionInput,
    },
  );
  return data.createPublicacion.id_publicaciones;
}

/** Obtiene todos los puntos de entrega disponibles */
export interface PuntoEntrega {
  id_puntos_entrega: number;
  nombre: string;
  descripcion?: string;
}
export async function getPuntosEntrega(): Promise<PuntoEntrega[]> {
  const data = await graphqlRequest<{ puntosEntrega: PuntoEntrega[] }>(GET_PUNTOS_ENTREGA_QUERY);
  return data.puntosEntrega ?? [];
}

/** Devuelve las donaciones del usuario (publicaciones con precio = 0) */
export async function getMisDonaciones(userId: string): Promise<Product[]> {
  const data = await graphqlRequest<{ publicaciones: GQLPublicacion[] }>(GET_PUBLICACIONES_QUERY);
  return (data.publicaciones ?? [])
    .filter((p) => String(p.id_usuarios) === userId && p.precio === 0)
    .map(mapPublicacion);
}

interface GQLPublicacion {
  id_publicaciones: number;
  id_usuarios: number;
  titulo: string;
  descripcion?: string;
  categoria: string;
  talla?: string;
  marca?: string;
  color?: string;
  estado_uso: string;
  precio: number;
  disponible: boolean;
  fecha_publicacion?: string;
  detallePublicaciones?: { url_foto: string; es_portada: boolean }[];
}

const CONDITION_MAP: Record<string, Product['condition']> = {
  NUEVO: 'excelente',
  BUENO: 'bueno',
  USADO: 'regular',
};

// Normaliza el nombre de categoría del backend al tipo del frontend
function toCategory(raw: string): ProductCategory {
  const lower = raw.toLowerCase() as ProductCategory;
  const valid: ProductCategory[] = ['sudaderas', 'playeras', 'pantalones', 'chamarras', 'zapatos', 'accesorios'];
  return valid.includes(lower) ? lower : 'accesorios';
}

export async function getPublicaciones(): Promise<Product[]> {
  const data = await graphqlRequest<{ publicaciones: GQLPublicacion[] }>(
    GET_PUBLICACIONES_QUERY,
  );
  return (data.publicaciones ?? [])
    .filter((p) => p.disponible !== false)  // excluir productos vendidos
    .map(mapPublicacion);
}

/** Devuelve TODAS las publicaciones de un usuario, incluyendo las ya vendidas */
export async function getMisPublicaciones(userId: string): Promise<Product[]> {
  const data = await graphqlRequest<{ publicaciones: GQLPublicacion[] }>(
    GET_PUBLICACIONES_QUERY,
  );
  return (data.publicaciones ?? [])
    .filter((p) => String(p.id_usuarios) === userId)
    .map(mapPublicacion);
}

/** Devuelve solo las publicaciones vendidas (disponible = false) del usuario */
export async function getMisVentas(userId: string): Promise<Product[]> {
  const data = await graphqlRequest<{ publicaciones: GQLPublicacion[] }>(
    GET_PUBLICACIONES_QUERY,
  );
  return (data.publicaciones ?? [])
    .filter((p) => String(p.id_usuarios) === userId && p.disponible === false)
    .map(mapPublicacion);
}

function mapPublicacion(p: GQLPublicacion): Product {
  const toHttps = (url?: string) => url?.replace(/^http:\/\//i, 'https://');
  const fotos = p.detallePublicaciones ?? [];
  const cover = fotos.find((f) => f.es_portada)?.url_foto ?? fotos[0]?.url_foto;
  return {
    id:          String(p.id_publicaciones),
    name:        p.titulo,
    price:       p.precio,
    category:    toCategory(p.categoria),
    image:       toHttps(cover),
    fotos:       fotos.map((f) => toHttps(f.url_foto)!),
    sku:         String(p.id_publicaciones),
    stock:       1,
    size:        p.talla,
    condition:   CONDITION_MAP[p.estado_uso] ?? 'bueno',
    brand:       p.marca,
    description: p.descripcion,
    color:       p.color,
    sellerId:    String(p.id_usuarios),
    disponible:  p.disponible,
    createdAt:   p.fecha_publicacion,
  };
}
