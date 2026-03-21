import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateUsuarioInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  nombre?: string;

  @Field({ nullable: true })
  apellido_paterno?: string;

  @Field({ nullable: true })
  apellido_materno?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  telefono?: string;

  @Field({ nullable: true })
  matricula?: string;

  @Field({ nullable: true })
  foto_perfil?: string;

  @Field({ nullable: true })
  direccion?: string;
}

export default UpdateUsuarioInput;
