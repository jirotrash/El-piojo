import { InputType, PartialType } from '@nestjs/graphql';
import { CreateUsuariosInput } from './create-usuarios.input';

@InputType()
export class UpdateUsuariosInput extends PartialType(CreateUsuariosInput) {}

