import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UsuariosType {
  @Field(() => Int)
  id_usuarios: number;

  @Field(() => Int, { nullable: true })
  id_roles?: number;

  @Field(() => Int, { nullable: true })
  id_carreras?: number;

  @Field(() => Int, { nullable: true })
  id_municipios?: number;

  @Field()
  nombre: string;

  @Field()
  apellido_paterno: string;

  @Field({ nullable: true })
  apellido_materno?: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  telefono?: string;

  @Field({ nullable: true })
  matricula?: string;

  @Field({ nullable: true })
  foto_perfil?: string;

  @Field({ nullable: true })
  direccion?: string;

  @Field()
  fecha_registro: string;
}
