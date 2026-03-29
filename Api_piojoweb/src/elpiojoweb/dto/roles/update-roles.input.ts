import { InputType, PartialType } from '@nestjs/graphql';
import { CreateRolesInput } from './create-roles.input';

@InputType()
export class UpdateRolesInput extends PartialType(CreateRolesInput) {}

