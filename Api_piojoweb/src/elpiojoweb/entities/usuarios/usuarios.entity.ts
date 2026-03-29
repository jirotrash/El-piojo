import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Roles } from '../roles/roles.entity';
import { Carreras } from '../carreras/carreras.entity';
import { Municipios } from '../municipios/municipios.entity';
import { Publicaciones } from '../publicaciones/publicaciones.entity';
import { Conversaciones } from '../conversaciones/conversaciones.entity';

@Entity({ name: 'usuarios' })
export class Usuarios {
  @PrimaryGeneratedColumn({ name: 'id_usuarios' })
  id_usuarios: number;

  @ManyToOne(() => Roles, (r) => r.usuarios, { nullable: true })
  @JoinColumn({ name: 'id_roles' })
  role?: Roles;

  @ManyToOne(() => Carreras, (c) => c.usuarios, { nullable: true })
  @JoinColumn({ name: 'id_carreras' })
  carrera?: Carreras;

  @ManyToOne(() => Municipios, (m) => m.puntos_entrega)
  @JoinColumn({ name: 'id_municipios' })
  municipio: Municipios;

  @Column({ length: 50 })
  nombre: string;

  @Column({ length: 50 })
  apellido_paterno: string;

  @Column({ length: 50, nullable: true })
  apellido_materno?: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 15, nullable: true })
  telefono?: string;

  @Column({ length: 20, nullable: true })
  matricula?: string;

  @Column({ type: 'text', nullable: true })
  foto_perfil?: string;

  @Column({ type: 'text', nullable: true })
  direccion?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @OneToMany(() => Publicaciones, (p) => p.usuario)
  publicaciones: Publicaciones[];

  @OneToMany(() => Conversaciones, (c) => c.vendedor)
  conversaciones_vendedor: Conversaciones[];

  @OneToMany(() => Conversaciones, (c) => c.comprador)
  conversaciones_comprador: Conversaciones[];
}
