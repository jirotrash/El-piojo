import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class PuntosEntregaType {
  @Field(() => Int)
  id_puntos_entrega: number;

  @Field()
  nombre: string;

  @Field(() => Int, { nullable: true })
  id_municipios?: number;

  @Field(() => Float)
  latitud: number;

  @Field(() => Float)
  longitud: number;

  @Field({ nullable: true })
  descripcion?: string;
}
