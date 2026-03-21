// ============ ESTADOS ============
export interface Estado {
  id_estados: number;
  nombre: string;
}
export const estados: Estado[] = [];

// ============ MUNICIPIOS ============
export interface Municipio {
  id_municipios: number;
  id_estados: number;
  nombre: string;
}
export const municipios: Municipio[] = [];

// ============ ROLES ============
export interface Rol {
  id_roles: number;
  nombre: string;
}
export const roles: Rol[] = [];

// ============ CARRERAS ============
export interface Carrera {
  id_carreras: number;
  nombre: string;
  universidad: string;
}
export const carreras: Carrera[] = [];

// ============ USUARIOS ============
export interface Usuario {
  id_usuarios: number;
  id_roles: number;
  id_carreras: number;
  id_municipios: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  matricula: string;
  foto_perfil: string;
  direccion: string;
  fecha_registro: string;
}
export const usuarios: Usuario[] = [];

// ============ PUNTOS DE ENTREGA ============
export interface PuntoEntrega {
  id_puntos_entrega: number;
  id_municipios: number;
  nombre: string;
  latitud: number;
  longitud: number;
  descripcion: string;
}
export const puntosEntrega: PuntoEntrega[] = [];

// ============ PUBLICACIONES ============
export type GeneroEnum = "Hombre" | "Mujer" | "Unisex";
export type EstadoUsoEnum = "Nuevo" | "Seminuevo" | "Usado";

export interface Publicacion {
  id_publicaciones: number;
  id_usuarios: number;
  id_puntos_entrega: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  talla: string;
  marca: string;
  color: string;
  genero: GeneroEnum;
  estado_uso: EstadoUsoEnum;
  precio: number;
  disponible: boolean;
  fecha_publicacion: string;
}
export const publicaciones: Publicacion[] = [];

// ============ CONVERSACIONES ============
export interface Conversacion {
  id_conversaciones: number;
  id_publicaciones: number;
  id_vendedor: number;
  id_comprador: number;
  fecha_creacion: string;
}
export const conversaciones: Conversacion[] = [];

// ============ DETALLE MENSAJES ============
export interface DetalleMensaje {
  id_detalle_mensajes: number;
  id_conversaciones: number;
  id_emisor: number;
  mensaje: string;
  fecha_envio: string;
}
export const detalleMensajes: DetalleMensaje[] = [];

// ============ PAGOS ============
export type MetodoPagoEnum = "Efectivo" | "Transferencia" | "Tarjeta";
export type EstadoPagoEnum = "Pendiente" | "Completado" | "Cancelado";

export interface Pago {
  id_pagos: number;
  id_usuarios_pagador: number;
  id_historial_cupones: number | null;
  total: number;
  total_con_descuento: number;
  metodo_pago: MetodoPagoEnum;
  estado: EstadoPagoEnum;
  fecha_pago: string;
  url_comprobante: string;
}
export const pagos: Pago[] = [];

// ============ HISTORIAL TRATOS ============
export interface HistorialTrato {
  id_historial_tratos: number;
  id_pagos: number;
  id_vendedor: number;
  id_comprador: number;
  fecha_cierre: string;
  calificacion: number;
  comentario: string;
}
export const historialTratos: HistorialTrato[] = [];

// ============ DETALLE VENTA ============
export interface DetalleVenta {
  id_detalle_venta: number;
  id_pagos: number;
  id_publicaciones: number;
  cantidad: number;
  subtotal: number;
}
export const detalleVentas: DetalleVenta[] = [];

// ============ HISTORIAL CUPONES ============
export interface HistorialCupon {
  id_historial_cupones: number;
  monto: number;
  fecha_expiracion: string;
}
export const historialCupones: HistorialCupon[] = [];

// ============ DETALLE PUBLICACIONES ============
export interface DetallePublicacion {
  id_detalle_publicaciones: number;
  id_publicaciones: number;
  id_detalle_mensajes: number | null;
  url_foto: string;
  es_portada: boolean;
}
export const detallePublicaciones: DetallePublicacion[] = [];
