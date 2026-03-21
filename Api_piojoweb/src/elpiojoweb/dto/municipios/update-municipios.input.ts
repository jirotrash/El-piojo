import { InputType, PartialType } from '@nestjs/graphql';
import { CreateMunicipiosInput } from './create-municipios.input';

@InputType()
export class UpdateMunicipiosInput extends PartialType(CreateMunicipiosInput) {}

