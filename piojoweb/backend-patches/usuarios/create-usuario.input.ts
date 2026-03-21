import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUsuarioInput {
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
}

export default CreateUsuarioInput;
