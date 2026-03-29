import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class DetallePublicacionesType {
  @Field(() => Int)
  id_detalle_publicaciones: number;

  @Field(() => Int, { nullable: true })
  id_publicaciones?: number;

  @Field()
  url_foto: string;

  @Field()
  es_portada: boolean;
}
