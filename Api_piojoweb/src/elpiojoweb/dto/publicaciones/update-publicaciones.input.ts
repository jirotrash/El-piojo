import { InputType } from '@nestjs/graphql';
import { PartialType } from '@nestjs/graphql';
import { CreatePublicacionesInput } from './create-publicaciones.input';

@InputType()
export class UpdatePublicacionesInput extends PartialType(CreatePublicacionesInput) {}

