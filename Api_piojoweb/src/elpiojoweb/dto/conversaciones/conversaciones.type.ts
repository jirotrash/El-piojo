import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UsuariosType } from '../usuarios/usuarios.type';
import { PublicacionesType } from '../publicaciones/publicaciones.type';

@ObjectType()
export class ConversacionesType {
  @Field(() => Int)
  id_conversaciones: number;

  @Field(() => PublicacionesType, { nullable: true })
  publicacion?: PublicacionesType;

  @Field(() => UsuariosType, { nullable: true })
  vendedor?: UsuariosType;

  @Field(() => UsuariosType, { nullable: true })
  comprador?: UsuariosType;

  @Field()
  fecha_creacion: string;
}
