import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateCarreraInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  universidad: string;
}
