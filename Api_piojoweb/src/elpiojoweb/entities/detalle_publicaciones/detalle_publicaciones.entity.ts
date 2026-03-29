import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Publicaciones } from '../publicaciones/publicaciones.entity';
import { DetalleMensajes } from '../detalle_mensajes/detalle_mensajes.entity';

@Entity({ name: 'detalle_publicaciones' })
export class DetallePublicaciones {
  @PrimaryGeneratedColumn({ name: 'id_detalle_publicaciones' })
  id_detalle_publicaciones: number;

  @ManyToOne(() => Publicaciones, (p) => p.fotos)
  @JoinColumn({ name: 'id_publicaciones' })
  publicacion: Publicaciones;

  @ManyToOne(() => DetalleMensajes, { nullable: true })
  @JoinColumn({ name: 'id_detalle_mensajes' })
  detalle_mensaje?: DetalleMensajes;

  @Column({ type: 'text' })
  url_foto: string;

  @Column({ default: false })
  es_portada: boolean;
}
