import { InputType, PartialType } from '@nestjs/graphql';
import { CreateEstadosInput } from './create-estados.input';

@InputType()
export class UpdateEstadosInput extends PartialType(CreateEstadosInput) {}

