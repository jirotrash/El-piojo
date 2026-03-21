import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class MunicipiosType {
  @Field(() => Int)
  id_municipios: number;

  @Field(() => Int, { nullable: true })
  id_estados?: number;

  @Field()
  nombre: string;
}
